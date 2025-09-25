<template>
  <section class="create-actor">
    <header class="page-header">
      <h1>Neuen Darsteller anlegen</h1>
      <p>
        Ziehe zwei Portraits hinein, ergänze persönliche Angaben und hinterlasse Social-Media-Profile, um einen
        Darsteller anzulegen.
      </p>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <fieldset class="form-section" aria-describedby="images-help">
        <legend>Portraits</legend>

        <div class="dropzone-grid">
          <div
            class="dropzone"
            :class="{ 'dropzone--active': isDraggingPrimary }"
            @dragenter.prevent="onPrimaryDragEnter"
            @dragover.prevent="onPrimaryDragEnter"
            @dragleave.prevent="onPrimaryDragLeave"
            @drop.prevent="onPrimaryDrop"
          >
            <input
              id="primary-image-upload"
              type="file"
              accept="image/*"
              class="dropzone__input"
              @change="onPrimaryInputChange"
            />

            <label class="dropzone__content" for="primary-image-upload">
              <span class="dropzone__icon" aria-hidden="true">🖼️</span>
              <span class="dropzone__text">
                <strong>Hauptportrait hochladen</strong>
                <span>Ziehe ein Bild hierher oder klicke zum Auswählen</span>
              </span>
              <span class="dropzone__hint" id="images-help">Unterstützt werden JPG, PNG, GIF und WebP.</span>
              <span v-if="primaryImage" class="dropzone__file">Ausgewählt: {{ primaryImage.name }}</span>
              <span v-else class="dropzone__hint">Noch kein Bild ausgewählt</span>
            </label>
          </div>

          <div
            class="dropzone"
            :class="{ 'dropzone--active': isDraggingSecondary }"
            @dragenter.prevent="onSecondaryDragEnter"
            @dragover.prevent="onSecondaryDragEnter"
            @dragleave.prevent="onSecondaryDragLeave"
            @drop.prevent="onSecondaryDrop"
          >
            <input
              id="secondary-image-upload"
              type="file"
              accept="image/*"
              class="dropzone__input"
              @change="onSecondaryInputChange"
            />

            <label class="dropzone__content" for="secondary-image-upload">
              <span class="dropzone__icon" aria-hidden="true">🖼️</span>
              <span class="dropzone__text">
                <strong>Zweites Portrait hochladen</strong>
                <span>Ideal für Ganzkörper- oder Szenenbilder</span>
              </span>
              <span class="dropzone__hint">Unterstützt werden JPG, PNG, GIF und WebP.</span>
              <span v-if="secondaryImage" class="dropzone__file">Ausgewählt: {{ secondaryImage.name }}</span>
              <span v-else class="dropzone__hint">Noch kein Bild ausgewählt</span>
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset class="form-section">
        <legend>Persönliche Angaben</legend>

        <label class="form-control">
          <span>Name / Künstlername</span>
          <input v-model="displayName" type="text" name="displayName" required placeholder="Name" />
        </label>

        <label class="form-control">
          <span>Vorname (firstName)</span>
          <input v-model="firstName" type="text" name="firstName" required placeholder="Vorname" />
        </label>

        <label class="form-control">
          <span>Nachname (lastName)</span>
          <input v-model="lastName" type="text" name="lastName" required placeholder="Nachname" />
        </label>

        <label class="form-control">
          <span>Land</span>
          <input v-model="country" type="text" name="country" required placeholder="z. B. Deutschland" />
        </label>

        <label class="form-control">
          <span>Körpergröße (cm)</span>
          <input
            v-model.number="heightCm"
            type="number"
            name="height"
            min="0"
            step="0.1"
            required
            placeholder="z. B. 182.5"
          />
        </label>

        <label class="form-control">
          <span>Measurements (cm)</span>
          <input
            v-model.number="measurementCm"
            type="number"
            name="measurement"
            min="0"
            step="0.1"
            required
            placeholder="z. B. 94"
          />
        </label>

        <label class="form-control">
          <span>Rolle</span>
          <select v-model="role" name="role" required>
            <option value="Top">Top</option>
            <option value="Bottom">Bottom</option>
            <option value="Versatile">Versatile</option>
          </select>
        </label>

        <label class="form-control" :class="{ 'form-control--error': birthdateError }">
          <span>Geburtsdatum</span>
          <input
            v-model="birthdate"
            type="text"
            name="birthdate"
            required
            placeholder="JJJJ, JJJJ-MM oder JJJJ-MM-DD"
            aria-describedby="birthdate-help"
            @blur="validateBirthdate"
          />
          <p id="birthdate-help" class="helper-text">
            Erlaubte Formate: 1988, 1988-03 oder 1988-03-21
          </p>
          <p v-if="birthdateError" class="helper-text helper-text--error">{{ birthdateError }}</p>
        </label>
      </fieldset>

      <fieldset class="form-section">
        <legend>Social Media Links</legend>

        <ul class="social-links" aria-label="Social Media Links">
          <li v-for="(link, index) in socialLinks" :key="index" class="social-links__item">
            <label class="form-control">
              <span class="visually-hidden">Social Link {{ index + 1 }}</span>
              <input
                v-model="socialLinks[index]"
                type="url"
                :name="`social-link-${index}`"
                placeholder="https://instagram.com/darsteller"
              />
            </label>
            <button
              v-if="socialLinks.length > 1"
              type="button"
              class="link-remove"
              @click="removeSocialLink(index)"
            >
              Entfernen
            </button>
          </li>
        </ul>

        <button type="button" class="link-add" @click="addSocialLink">Weiteren Link hinzufügen</button>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="submit-button">Darsteller erstellen</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';

import { useRouter } from '../router';
import { useSnackbar } from '../composables/useSnackbar';

const router = useRouter();
const { showSnackbar } = useSnackbar();

const displayName = ref('');
const firstName = ref('');
const lastName = ref('');
const country = ref('');
const heightCm = ref<number | null>(null);
const measurementCm = ref<number | null>(null);
const role = ref<'Top' | 'Bottom' | 'Versatile'>('Top');
const birthdate = ref('');
const birthdateError = ref('');
const socialLinks = ref<string[]>(['']);
const hasShownSocialLinkHint = ref(false);

const primaryImage = ref<File | null>(null);
const secondaryImage = ref<File | null>(null);

const isDraggingPrimary = ref(false);
const isDraggingSecondary = ref(false);

const imageRegex = /^image\//;
const birthdateRegex = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const resetDragIfNeeded = (event: DragEvent, isDragging: Ref<boolean>) => {
  const currentTarget = event.currentTarget as HTMLElement | null;
  const relatedTarget = event.relatedTarget;

  if (currentTarget && relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
    return;
  }

  isDragging.value = false;
};

const extractImage = (files: FileList | null | undefined) => {
  if (!files || files.length === 0) {
    return null;
  }

  const file = files[0];
  if (!imageRegex.test(file.type)) {
    return null;
  }

  return file;
};

const onPrimaryDragEnter = () => {
  isDraggingPrimary.value = true;
};

const onPrimaryDragLeave = (event: DragEvent) => {
  resetDragIfNeeded(event, isDraggingPrimary);
};

const onPrimaryDrop = (event: DragEvent) => {
  const file = extractImage(event.dataTransfer?.files);
  isDraggingPrimary.value = false;

  if (file) {
    primaryImage.value = file;
  }
};

const onPrimaryInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  primaryImage.value = extractImage(target.files);
};

const onSecondaryDragEnter = () => {
  isDraggingSecondary.value = true;
};

const onSecondaryDragLeave = (event: DragEvent) => {
  resetDragIfNeeded(event, isDraggingSecondary);
};

const onSecondaryDrop = (event: DragEvent) => {
  const file = extractImage(event.dataTransfer?.files);
  isDraggingSecondary.value = false;

  if (file) {
    secondaryImage.value = file;
  }
};

const onSecondaryInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  secondaryImage.value = extractImage(target.files);
};

const addSocialLink = () => {
  socialLinks.value.push('');
};

const removeSocialLink = (index: number) => {
  if (socialLinks.value.length === 1) {
    socialLinks.value[0] = '';

    if (!hasShownSocialLinkHint.value) {
      showSnackbar('Hinweis: Mindestens ein Social-Link-Feld bleibt zur Orientierung bestehen.', 'info');
      hasShownSocialLinkHint.value = true;
    }

    return;
  }

  socialLinks.value.splice(index, 1);
};

const validateBirthdate = () => {
  if (!birthdate.value) {
    birthdateError.value = 'Bitte gib ein Geburtsdatum an.';
    return false;
  }

  if (!birthdateRegex.test(birthdate.value.trim())) {
    birthdateError.value = 'Geburtsdatum muss dem Format JJJJ, JJJJ-MM oder JJJJ-MM-DD entsprechen.';
    return false;
  }

  birthdateError.value = '';
  return true;
};

const handleSubmit = () => {
  const isValidBirthdate = validateBirthdate();

  if (!isValidBirthdate) {
    showSnackbar('Bitte gib ein gültiges Geburtsdatum ein.', 'error');
    return;
  }

  const payload = {
    name: displayName.value,
    firstName: firstName.value,
    lastName: lastName.value,
    country: country.value,
    heightCm: heightCm.value,
    measurementCm: measurementCm.value,
    role: role.value,
    birthdate: birthdate.value,
    socialLinks: socialLinks.value.map((link) => link.trim()).filter(Boolean),
    primaryImage: primaryImage.value?.name ?? null,
    secondaryImage: secondaryImage.value?.name ?? null,
  };

  console.log('Neuen Darsteller erstellen', payload);
  showSnackbar('Darsteller wurde erfolgreich erstellt.', 'success');
  router.push('/darsteller');
};
</script>

<style scoped>
.create-actor {
  max-width: 860px;
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

.dropzone-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .dropzone-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
.form-control input[type='url'],
.form-control input[type='number'],
.form-control select {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #cfcfe0;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control input[type='text']:focus,
.form-control input[type='url']:focus,
.form-control input[type='number']:focus,
.form-control select:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  outline: none;
}

.form-control--error input {
  border-color: #ff4d6d;
}

.helper-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6a6a7d;
}

.helper-text--error {
  color: #ff4d6d;
}

.social-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.social-links__item {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.link-remove,
.link-add {
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-remove {
  background: #ffe8ec;
  color: #c92a5d;
  box-shadow: 0 0.5rem 1.25rem rgba(201, 42, 93, 0.15);
}

.link-remove:hover,
.link-remove:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 0.75rem 1.5rem rgba(201, 42, 93, 0.25);
}

.link-add {
  align-self: flex-start;
  background: linear-gradient(135deg, #6c5ce7, #836fff);
  color: #ffffff;
  box-shadow: 0 0.75rem 1.5rem rgba(108, 92, 231, 0.25);
}

.link-add:hover,
.link-add:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 1rem 2rem rgba(108, 92, 231, 0.35);
}

.link-remove:focus-visible,
.link-add:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
