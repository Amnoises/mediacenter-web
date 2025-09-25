<template>
  <section class="create-movie">
    <header class="page-header">
      <h1>Neuen Film hinzufügen</h1>
      <p>Ziehe die Videodatei hinein, ergänze die Details und lade begleitende Materialien hoch.</p>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <fieldset class="form-section" aria-describedby="video-help">
        <legend>Filmdatei</legend>
        <div
          class="dropzone"
          :class="{ 'dropzone--active': isDraggingVideo }"
          @dragenter.prevent="onVideoDragEnter"
          @dragover.prevent="onVideoDragEnter"
          @dragleave.prevent="onVideoDragLeave"
          @drop.prevent="onVideoDrop"
        >
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            class="dropzone__input"
            @change="onVideoInputChange"
          />

          <label class="dropzone__content" for="video-upload">
            <span class="dropzone__icon" aria-hidden="true">📁</span>
            <span class="dropzone__text">
              <strong>Film hierher ziehen</strong>
              <span>oder zum Auswählen klicken</span>
            </span>
            <span class="dropzone__hint" id="video-help">Unterstützte Formate: MP4, MKV, MOV, AVI uvm.</span>
            <span v-if="videoFile" class="dropzone__file">Ausgewählt: {{ videoFile.name }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset class="form-section">
        <legend>Filmdetails</legend>
        <label class="form-control">
          <span>Titel</span>
          <input v-model="title" type="text" name="title" required placeholder="Titel des Films" />
        </label>

        <label class="form-control">
          <span>Veröffentlichungsdatum</span>
          <input v-model="releaseDate" type="date" name="releaseDate" required />
        </label>
      </fieldset>

      <fieldset class="form-section" aria-describedby="assets-help">
        <legend>Begleitmaterial</legend>
        <label class="form-control form-control--file" for="asset-upload">
          <span>ZIP / JPG / PNG hochladen</span>
          <input
            id="asset-upload"
            type="file"
            accept=".zip,image/jpeg,image/png"
            @change="onAssetInputChange"
          />
        </label>
        <p id="assets-help" class="helper-text">
          Optionale Zusatzinhalte wie Poster, Pressemappen oder Galerien (max. eine Datei).
        </p>
        <p v-if="assetFile" class="helper-text helper-text--file">Ausgewählt: {{ assetFile.name }}</p>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="submit-button">Film erstellen</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useSnackbar } from '../composables/useSnackbar'
import { useRouter } from '../router'

const router = useRouter()
const { showSnackbar } = useSnackbar()

const title = ref('')
const releaseDate = ref(new Date().toISOString().split('T')[0])
const videoFile = ref<File | null>(null)
const assetFile = ref<File | null>(null)
const isDraggingVideo = ref(false)

const onVideoDragEnter = () => {
  isDraggingVideo.value = true
}

const onVideoDragLeave = (event: DragEvent) => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget

  if (currentTarget && relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
    return
  }

  isDraggingVideo.value = false
}

const onVideoDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  isDraggingVideo.value = false

  if (files && files.length > 0) {
    videoFile.value = files[0]
  }
}

const onVideoInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  videoFile.value = target.files && target.files[0] ? target.files[0] : null
}

const onAssetInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  assetFile.value = target.files && target.files[0] ? target.files[0] : null
}

const handleSubmit = () => {
  if (!videoFile.value) {
    showSnackbar('Bitte wähle eine Filmdatei aus, bevor du fortfährst.', 'error')
    return
  }

  const formData = {
    title: title.value,
    releaseDate: releaseDate.value,
    videoFile: videoFile.value?.name ?? null,
    assetFile: assetFile.value?.name ?? null,
  }

  console.log('Film erstellen', formData)
  showSnackbar('Film wurde erfolgreich erstellt.', 'success')
  router.push('/movies')
}
</script>

<style scoped>
.create-movie {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: grid;
  gap: 2.5rem;
}

.page-header h1 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
}

.page-header p {
  margin: 0;
  color: #4b4b57;
  line-height: 1.5;
}

.form {
  display: grid;
  gap: 2rem;
}

.form-section {
  border: 1px solid #dcdce5;
  border-radius: 16px;
  padding: 1.75rem;
  display: grid;
  gap: 1.5rem;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(31, 31, 36, 0.04);
}

.form-section legend {
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0 0.5rem;
}

.dropzone {
  position: relative;
  border: 2px dashed #c7c7d6;
  border-radius: 14px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: #fafaff;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.dropzone--active {
  border-color: #6c5ce7;
  background: rgba(108, 92, 231, 0.08);
}

.dropzone__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.dropzone__content {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  color: #3c3c4d;
  cursor: pointer;
}

.dropzone__icon {
  font-size: 2rem;
}

.dropzone__text span {
  display: block;
  font-size: 0.95rem;
  color: #626277;
}

.dropzone__hint {
  font-size: 0.875rem;
  color: #8b8ba1;
}

.dropzone__file {
  font-size: 0.9rem;
  color: #2f2f3a;
}

.form-control {
  display: grid;
  gap: 0.5rem;
}

.form-control span {
  font-weight: 600;
  color: #2f2f3a;
}

.form-control input[type='text'],
.form-control input[type='date'] {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #cfcfe0;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control input[type='text']:focus,
.form-control input[type='date']:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  outline: none;
}

.form-control--file input[type='file'] {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px dashed #cfcfe0;
  background: #f8f8ff;
}

.helper-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6a6a7d;
}

.helper-text--file {
  color: #2f2f3a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  padding: 0.85rem 2.5rem;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #ff7a59, #ff3d81);
  cursor: pointer;
  box-shadow: 0 0.75rem 1.5rem rgba(255, 61, 129, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-button:hover,
.submit-button:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 1rem 2rem rgba(255, 61, 129, 0.35);
}

.submit-button:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}
</style>
