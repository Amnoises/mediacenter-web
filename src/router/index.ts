import type { App, Component, ComputedRef } from 'vue'
import { computed, defineComponent, h, inject, ref, shallowRef } from 'vue'

type NavigationType = 'push' | 'replace' | 'pop'

type AsyncComponent = () => Promise<{ default?: Component } | Component>

type RouteRecord = {
  path: string
  name?: string
  component?: Component | AsyncComponent
  redirect?: string
}

type HistoryListener = (path: string, type: NavigationType) => void

type History = {
  location: () => string
  push: (path: string) => void
  replace: (path: string) => void
  listen: (listener: HistoryListener) => void
}

const ROUTER_KEY = Symbol('router')

function normalizePath(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

function createWebHistory(): History {
  const listeners = new Set<HistoryListener>()

  const getLocation = () => normalizePath(window.location.pathname || '/')

  const notify = (type: NavigationType) => {
    const path = getLocation()
    listeners.forEach((listener) => listener(path, type))
  }

  window.addEventListener('popstate', () => notify('pop'))

  return {
    location: getLocation,
    push(path) {
      const normalized = normalizePath(path)
      if (normalized === getLocation()) {
        return
      }

      window.history.pushState({}, '', normalized)
      notify('push')
    },
    replace(path) {
      const normalized = normalizePath(path)
      window.history.replaceState({}, '', normalized)
      notify('replace')
    },
    listen(listener) {
      listeners.add(listener)
    },
  }
}

type RouterOptions = {
  history?: History
  routes: RouteRecord[]
}

type Router = {
  currentRoute: ComputedRef<{ path: string }>
  currentComponent: ReturnType<typeof shallowRef<Component | null>>
  push: (path: string) => void
  replace: (path: string) => void
  install: (app: App) => void
}

async function resolveComponent(component?: Component | AsyncComponent) {
  if (!component) {
    return null
  }

  if (typeof component === 'function') {
    const resolved = await component()
    if (typeof resolved === 'object' && 'default' in resolved && resolved.default) {
      return resolved.default
    }

    return resolved as Component
  }

  return component
}

function createRouter(options: RouterOptions): Router {
  const history = options.history ?? createWebHistory()
  const routes = options.routes
  const currentPath = ref(history.location())
  const currentComponent = shallowRef<Component | null>(null)
  let latestNavigationId = 0

  const matchRoute = (path: string): RouteRecord | undefined =>
    routes.find((route) => normalizePath(route.path) === normalizePath(path))

  const applyRoute = async (path: string, type: NavigationType) => {
    latestNavigationId += 1
    const navigationId = latestNavigationId
    let targetPath = normalizePath(path)
    const record = matchRoute(targetPath)

    if (record?.redirect) {
      const redirectTarget = normalizePath(record.redirect)
      if (redirectTarget === targetPath) {
        return
      }

      if (type === 'replace' || type === 'pop') {
        history.replace(redirectTarget)
      } else {
        history.push(redirectTarget)
      }
      return
    }

    currentPath.value = targetPath

    const component = await resolveComponent(record?.component)

    if (navigationId !== latestNavigationId) {
      return
    }

    currentComponent.value = component
  }

  history.listen((path, type) => {
    void applyRoute(path, type)
  })

  void applyRoute(currentPath.value, 'replace')

  const router = {
    currentRoute: computed(() => ({ path: currentPath.value })),
    currentComponent,
    push(path: string) {
      history.push(path)
    },
    replace(path: string) {
      history.replace(path)
    },
    install(app: App) {
      app.provide(ROUTER_KEY, router)
      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)
    },
  }

  return router
}

function useRouter(): Router {
  const router = inject<Router>(ROUTER_KEY)
  if (!router) {
    throw new Error('Router instance is not available.')
  }

  return router
}

const RouterView = defineComponent({
  name: 'RouterView',
  setup() {
    const router = useRouter()
    return () => {
      const component = router.currentComponent.value
      return component ? h(component) : null
    }
  },
})

const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const router = useRouter()
    const isActive = computed(() => router.currentRoute.value.path === normalizePath(props.to))

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) {
        return
      }

      event.preventDefault()
      if (!isActive.value) {
        router.push(props.to)
      }
    }

    return () =>
      h(
        'a',
        {
          href: normalizePath(props.to),
          class: {
            'router-link-active': isActive.value,
          },
          'aria-current': isActive.value ? 'page' : undefined,
          onClick,
        },
        slots.default ? slots.default() : []
      )
  },
})

export { createRouter, createWebHistory, RouterLink, RouterView, useRouter }

const router = createRouter({
  routes: [
    {
      path: '/',
      redirect: '/movies',
    },
    {
      path: '/movies',
      name: 'movies',
      component: () => import('../views/MoviesView.vue'),
    },
    {
      path: '/bilder',
      name: 'bilder',
      component: () => import('../views/BilderView.vue'),
    },
    {
      path: '/studio',
      name: 'studio',
      component: () => import('../views/StudioView.vue'),
    },
    {
      path: '/darsteller',
      name: 'darsteller',
      component: () => import('../views/DarstellerView.vue'),
    },
  ],
})

export default router
