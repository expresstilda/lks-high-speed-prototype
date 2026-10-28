'use strict';

const tabs = [...document.querySelectorAll('[data-tab]')];
function chooseTab(mode, focus = false) {
  for (const tab of tabs) {
    const active = tab.dataset.tab === mode;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(`panel-${tab.dataset.tab}`).hidden = !active;
    if (active && focus) tab.focus();
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => chooseTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      chooseTab(tabs[(index + 1) % tabs.length].dataset.tab, true);
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      chooseTab(tabs[event.key === 'Home' ? 0 : tabs.length - 1].dataset.tab, true);
    }
  });
});

document.querySelectorAll('[data-lead]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    chooseTab(button.dataset.lead);
    const form = document.getElementById(`${button.dataset.lead}-form`);
    if (button.dataset.brand) form.elements.namedItem('brand').value = button.dataset.brand;
    if (button.dataset.goal) form.elements.namedItem('goal').value = button.dataset.goal;
    const parameters = form.querySelector('.advanced-parameters');
    if (parameters && (button.dataset.brand || button.dataset.goal)) parameters.open = true;
    document.getElementById('request').scrollIntoView({block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
});

document.getElementById('notes-toggle')?.addEventListener('click', event => {
  const active = document.body.classList.toggle('show-notes');
  event.currentTarget.setAttribute('aria-pressed', String(active));
});

document.querySelectorAll('[data-device]').forEach(button => {
  button.addEventListener('click', () => {
    document.body.classList.toggle('mode-mobile', button.dataset.device === 'mobile');
    document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-nav');
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.dialog-close,[data-close-dialog]').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});

const projects = {
  silver: {title: 'ЖК «Серебро»', description: 'В публичном портфолио ЛифтКомфортСервис указаны поставка и монтаж 18 лифтов.'},
  clouds: {title: 'ЖК «Облака 2.0», ЖД2', description: 'В публичном портфолио ЛифтКомфортСервис указаны поставка и монтаж 14 лифтов.'}
};
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  document.getElementById('project-dialog-title').textContent = project.title;
  document.getElementById('project-dialog-description').textContent = project.description;
  document.getElementById('project-dialog').showModal();
}));
document.getElementById('copy-open').addEventListener('click', () => document.getElementById('copy-dialog').showModal());

document.querySelector('input[type=file]').addEventListener('change', event => {
  document.getElementById('file-name').textContent = event.target.files[0]?.name || 'Выбрать файл ↗';
});
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const contact = form.elements.namedItem('contact');
    if (!contact.value.trim()) {
      contact.setCustomValidity('Укажите демонстрационный контакт для проверки сценария.');
      contact.reportValidity();
      return;
    }
    contact.setCustomValidity('');
    document.getElementById('demo-dialog').showModal();
  });
  form.elements.namedItem('contact').addEventListener('input', event => event.target.setCustomValidity(''));
});

// Manufacturer images: local originals, captions and external source links.
const equipmentPhotoDialog = document.getElementById('equipment-photo-dialog');
let activeEquipmentGallery = null;
let activeEquipmentPhoto = 0;

function showEquipmentPhoto(gallery, index) {
  const items = [...gallery.querySelectorAll('[data-equipment-photo]')];
  const normalizedIndex = (index + items.length) % items.length;
  const selected = items[normalizedIndex];
  const preview = gallery.querySelector('.equipment-photo-open img');
  preview.src = selected.dataset.src;
  preview.alt = selected.dataset.alt;
  preview.width = Number(selected.dataset.width);
  preview.height = Number(selected.dataset.height);
  gallery.querySelector('.equipment-photo-caption').textContent = selected.dataset.caption;
  gallery.querySelector('.equipment-photo-source').href = selected.dataset.source;
  gallery.querySelector('.equipment-photo-open').setAttribute('aria-label', `Увеличить: ${selected.dataset.caption}`);
  items.forEach(item => item.setAttribute('aria-pressed', String(item === selected)));
  if (equipmentPhotoDialog.open && activeEquipmentGallery === gallery) {
    activeEquipmentPhoto = normalizedIndex;
    document.getElementById('equipment-photo-title').textContent = selected.dataset.caption;
    const image = document.getElementById('equipment-lightbox-image');
    image.src = selected.dataset.src;
    image.alt = selected.dataset.alt;
    document.getElementById('equipment-lightbox-source').href = selected.dataset.source;
    document.getElementById('equipment-photo-counter').textContent = `${normalizedIndex + 1} / ${items.length}`;
  }
}

document.querySelectorAll('.equipment-gallery').forEach(gallery => {
  const items = [...gallery.querySelectorAll('[data-equipment-photo]')];
  items.forEach((item, index) => item.addEventListener('click', () => showEquipmentPhoto(gallery, index)));
  gallery.querySelector('.equipment-photo-open').addEventListener('click', () => {
    activeEquipmentGallery = gallery;
    activeEquipmentPhoto = items.findIndex(item => item.getAttribute('aria-pressed') === 'true');
    equipmentPhotoDialog.showModal();
    showEquipmentPhoto(gallery, activeEquipmentPhoto);
  });
});

document.getElementById('equipment-photo-prev').addEventListener('click', () => showEquipmentPhoto(activeEquipmentGallery, activeEquipmentPhoto - 1));
document.getElementById('equipment-photo-next').addEventListener('click', () => showEquipmentPhoto(activeEquipmentGallery, activeEquipmentPhoto + 1));
equipmentPhotoDialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showEquipmentPhoto(activeEquipmentGallery, activeEquipmentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
});
