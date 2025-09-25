export interface BonjourServiceEntry {
  name?: string
  type?: string
  host?: string
  port?: number
  addresses?: string[]
  protocol?: 'tcp' | 'udp'
  txt?: Record<string, string>
  fqdn?: string
  fullname?: string
}

export interface DiscoverBonjourUrlOptions {
  /**
   * Optional explicit Bonjour service type, e.g. `_mediacenter._tcp.local`.
   * When omitted the type is derived from the given service name.
   */
  serviceType?: string
  /**
   * Optional list of HTTP endpoints that return Bonjour discovery results
   * as JSON. The first endpoint that responds successfully is used.
   */
  discoveryEndpoints?: string[]
  /**
   * Overrides the protocol that should be used when the Bonjour record
   * does not specify one. Defaults to the current location protocol.
   */
  protocolHint?: 'http' | 'https'
  /**
   * Optional AbortSignal that allows cancelling the discovery process.
   */
  signal?: AbortSignal
  /**
   * Timeout in milliseconds for each discovery request.
   * Defaults to 5000 ms.
   */
  timeout?: number
  /**
   * Fallback URL that is used when the service could not be discovered.
   */
  fallbackUrl?: string
  /**
   * Forces a new discovery request instead of using the cached result.
   */
  forceRefresh?: boolean
}

export interface BonjourDiscoveryError extends Error {
  causes?: unknown[]
}

const DEFAULT_TIMEOUT = 5000

const DEFAULT_DISCOVERY_ENDPOINTS = [
  '/api/discovery/bonjour',
  '/bonjour/discovery',
  '/api/bonjour',
]

const discoveryCache = new Map<string, string>()

function buildCacheKey(serviceName: string, serviceType?: string | undefined): string {
  return `${serviceName.toLowerCase()}|${serviceType ? normaliseServiceType(serviceType) : ''}`
}

function normaliseServiceType(type: string): string {
  return type.trim().toLowerCase().replace(/\.+$/, '').replace(/\.local$/, '')
}

function normaliseServiceName(name: string): string {
  return name.trim().toLowerCase()
}

function parseTxtRecord(rawTxt: unknown): Record<string, string> | undefined {
  if (!rawTxt) {
    return undefined
  }

  if (Array.isArray(rawTxt)) {
    const record: Record<string, string> = {}

    for (const entry of rawTxt) {
      if (typeof entry !== 'string') {
        continue
      }

      const separatorIndex = entry.indexOf('=')

      if (separatorIndex === -1) {
        record[entry] = ''
        continue
      }

      const key = entry.slice(0, separatorIndex)
      const value = entry.slice(separatorIndex + 1)
      record[key] = value
    }

    return record
  }

  if (typeof rawTxt === 'object') {
    const record: Record<string, string> = {}
    const entries = Object.entries(rawTxt as Record<string, unknown>)

    for (const [key, value] of entries) {
      record[key] = value == null ? '' : String(value)
    }

    return record
  }

  return undefined
}

function normaliseAddresses(rawAddresses: unknown): string[] | undefined {
  if (!rawAddresses) {
    return undefined
  }

  if (Array.isArray(rawAddresses)) {
    return rawAddresses.filter((address): address is string => typeof address === 'string' && address.length > 0)
  }

  if (typeof rawAddresses === 'string' && rawAddresses.length > 0) {
    return [rawAddresses]
  }

  return undefined
}

function toBonjourServiceEntry(raw: unknown): BonjourServiceEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const record = raw as Record<string, unknown>
  const txt = parseTxtRecord(record.txt)
  const addresses = normaliseAddresses(record.addresses ?? record.addr ?? record.ip)

  let port: number | undefined

  if (typeof record.port === 'number') {
    port = record.port
  } else if (typeof record.port === 'string') {
    const parsed = Number.parseInt(record.port, 10)
    port = Number.isFinite(parsed) ? parsed : undefined
  } else if (txt?.port) {
    const parsed = Number.parseInt(txt.port, 10)
    port = Number.isFinite(parsed) ? parsed : undefined
  }

  const name =
    (typeof record.name === 'string' && record.name.length > 0
      ? record.name
      : typeof record.service === 'string' && record.service.length > 0
        ? record.service
        : typeof txt?.name === 'string' && txt.name.length > 0
          ? txt.name
          : undefined)

  const host =
    (typeof record.host === 'string' && record.host.length > 0
      ? record.host
      : typeof record.hostname === 'string' && record.hostname.length > 0
        ? record.hostname
        : typeof record.fqdn === 'string' && record.fqdn.length > 0
          ? record.fqdn
          : addresses && addresses.length > 0
            ? addresses[0]
            : typeof txt?.host === 'string' && txt.host.length > 0
              ? txt.host
              : undefined)

  const type =
    (typeof record.type === 'string' && record.type.length > 0
      ? record.type
      : typeof record.fullname === 'string' && record.fullname.length > 0
        ? record.fullname
        : typeof record.fqdn === 'string' && record.fqdn.length > 0
          ? record.fqdn
          : typeof txt?.type === 'string' && txt.type.length > 0
            ? txt.type
            : typeof txt?.serviceType === 'string' && txt.serviceType.length > 0
              ? txt.serviceType
              : undefined)

  let protocol: 'tcp' | 'udp' | undefined

  if (typeof record.protocol === 'string') {
    const normalised = record.protocol.toLowerCase()
    if (normalised.includes('udp')) {
      protocol = 'udp'
    } else if (normalised.includes('tcp')) {
      protocol = 'tcp'
    }
  } else if (typeof txt?.protocol === 'string') {
    const normalised = txt.protocol.toLowerCase()
    if (normalised.includes('udp')) {
      protocol = 'udp'
    } else if (normalised.includes('tcp')) {
      protocol = 'tcp'
    }
  }

  return {
    name,
    type,
    host,
    port,
    addresses,
    txt,
    protocol,
    fqdn: typeof record.fqdn === 'string' ? record.fqdn : undefined,
    fullname: typeof record.fullname === 'string' ? record.fullname : undefined,
  }
}

function normaliseBonjourPayload(payload: unknown): BonjourServiceEntry[] {
  if (!payload) {
    return []
  }

  const items: unknown[] = []

  if (Array.isArray(payload)) {
    items.push(...payload)
  } else if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    if (Array.isArray(record.services)) {
      items.push(...record.services)
    } else if (record.service && typeof record.service === 'object') {
      items.push(record.service)
    } else {
      items.push(payload)
    }
  }

  return items
    .map(toBonjourServiceEntry)
    .filter((entry): entry is BonjourServiceEntry => entry !== null)
}

function normaliseCandidateTypes(serviceName: string, serviceType?: string): Set<string> {
  const candidates = new Set<string>()

  if (serviceType) {
    candidates.add(normaliseServiceType(serviceType))
  }

  const normalisedName = normaliseServiceName(serviceName)
  candidates.add(normaliseServiceType(`_${normalisedName}._tcp.local`))
  candidates.add(normaliseServiceType(`_${normalisedName}._tcp`))

  return candidates
}

function matchesService(entry: BonjourServiceEntry, serviceName: string, candidateTypes: Set<string>): boolean {
  const targetName = normaliseServiceName(serviceName)

  const possibleNames: (string | undefined)[] = [entry.name, entry.txt?.name, entry.txt?.service, entry.txt?.serviceName]

  for (const possibleName of possibleNames) {
    if (typeof possibleName === 'string' && normaliseServiceName(possibleName) === targetName) {
      return true
    }
  }

  const possibleTypes: (string | undefined)[] = [entry.type, entry.fullname, entry.fqdn, entry.txt?.type, entry.txt?.serviceType]

  for (const possibleType of possibleTypes) {
    if (typeof possibleType === 'string' && candidateTypes.has(normaliseServiceType(possibleType))) {
      return true
    }
  }

  return false
}

function inferProtocol(entry: BonjourServiceEntry, protocolHint?: 'http' | 'https'): 'http' | 'https' {
  const txt = entry.txt

  const protocolFromTxt = txt?.protocol ?? txt?.scheme ?? txt?.proto
  if (typeof protocolFromTxt === 'string') {
    const normalised = protocolFromTxt.toLowerCase()
    if (normalised.includes('https')) {
      return 'https'
    }
    if (normalised.includes('http')) {
      return 'http'
    }
  }

  const secureFlags = [txt?.secure, txt?.https, txt?.tls, txt?.ssl]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map((value) => value.toLowerCase())

  if (secureFlags.some((value) => value === '1' || value === 'true' || value === 'yes')) {
    return 'https'
  }

  if (protocolHint) {
    return protocolHint
  }

  if (typeof window !== 'undefined' && window.location?.protocol) {
    return window.location.protocol === 'https:' ? 'https' : 'http'
  }

  return 'http'
}

function buildServiceUrl(entry: BonjourServiceEntry, protocolHint?: 'http' | 'https'): string | null {
  const host = entry.txt?.host ?? entry.host ?? entry.addresses?.[0]

  if (!host) {
    return null
  }

  const protocol = inferProtocol(entry, protocolHint)

  let port = entry.port

  if (typeof port !== 'number' && entry.txt?.port) {
    const parsed = Number.parseInt(entry.txt.port, 10)
    port = Number.isFinite(parsed) ? parsed : undefined
  }

  const rawPath = entry.txt?.path ?? entry.txt?.url ?? ''
  const trimmedPath = rawPath.trim()
  const path = trimmedPath.length > 0 ? (trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`) : ''

  const needsPort = typeof port === 'number' && !Number.isNaN(port) && ((protocol === 'http' && port !== 80) || (protocol === 'https' && port !== 443))

  const hostWithPort = needsPort && port ? `${host}:${port}` : host

  return `${protocol}://${hostWithPort}${path}`
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeout: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController()

  const timer = setTimeout(() => controller.abort(), timeout)

  const abortHandler = () => controller.abort()

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', abortHandler, { once: true })
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
    if (signal) {
      signal.removeEventListener('abort', abortHandler)
    }
  }
}

async function fetchBonjourEntries(endpoint: string, options: { signal?: AbortSignal; timeout: number }): Promise<BonjourServiceEntry[]> {
  const response = await fetchWithTimeout(
    endpoint,
    {
      headers: {
        Accept: 'application/json',
      },
    },
    options.timeout,
    options.signal,
  )

  if (!response.ok) {
    throw new Error(`Bonjour Discovery request to "${endpoint}" failed with status ${response.status}`)
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch (error) {
    throw new Error(`Bonjour Discovery response from "${endpoint}" was not valid JSON`)
  }

  return normaliseBonjourPayload(payload)
}

export function resetBonjourDiscoveryCache(): void {
  discoveryCache.clear()
}

export async function discoverBonjourUrl(serviceName: string, options: DiscoverBonjourUrlOptions = {}): Promise<string> {
  if (!serviceName || typeof serviceName !== 'string') {
    throw new TypeError('discoverBonjourUrl: serviceName muss eine nicht-leere Zeichenkette sein.')
  }

  const cacheKey = buildCacheKey(serviceName, options.serviceType)

  if (!options.forceRefresh && discoveryCache.has(cacheKey)) {
    return discoveryCache.get(cacheKey) as string
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const endpoints = options.discoveryEndpoints && options.discoveryEndpoints.length > 0 ? options.discoveryEndpoints : DEFAULT_DISCOVERY_ENDPOINTS
  const candidateTypes = normaliseCandidateTypes(serviceName, options.serviceType)
  const errors: unknown[] = []

  for (const endpoint of endpoints) {
    try {
      const entries = await fetchBonjourEntries(endpoint, { signal: options.signal, timeout })
      const matchingEntry = entries.find((entry) => matchesService(entry, serviceName, candidateTypes))

      if (matchingEntry) {
        const url = buildServiceUrl(matchingEntry, options.protocolHint)

        if (url) {
          discoveryCache.set(cacheKey, url)
          return url
        }
      }
    } catch (error) {
      errors.push(error)
    }
  }

  const fallbackCandidates: (string | undefined)[] = [options.fallbackUrl, import.meta.env.VITE_BONJOUR_FALLBACK_URL]

  for (const fallback of fallbackCandidates) {
    if (typeof fallback === 'string' && fallback.length > 0) {
      discoveryCache.set(cacheKey, fallback)
      return fallback
    }
  }

  const error: BonjourDiscoveryError = new Error(`Bonjour-Service "${serviceName}" konnte nicht gefunden werden.`)
  if (errors.length > 0) {
    error.causes = errors
  }
  throw error
}

export async function discoverMediacenterUrl(options: Omit<DiscoverBonjourUrlOptions, 'serviceType'> = {}): Promise<string> {
  const serviceName = import.meta.env.VITE_BONJOUR_SERVICE_NAME || 'mediacenter'
  const serviceType = import.meta.env.VITE_BONJOUR_SERVICE_TYPE || '_mediacenter._tcp.local'

  return discoverBonjourUrl(serviceName, {
    ...options,
    serviceType,
  })
}
