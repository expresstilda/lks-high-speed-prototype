'use strict';

function activateTabs(buttons, index, panelId, focus = false) {
  buttons.forEach((button, i) => {
    const active = i === index;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    document.getElementById(panelId(button)).hidden = !active;
    if (active && button.dataset.tab) updateContext(document.getElementById(`${button.dataset.tab}-form`));
    if (active && focus) button.focus();
  });
}
function wireTabs(buttons, panelId) {
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activateTabs(buttons, index, panelId));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activateTabs(buttons, next, panelId, true);
    });
  });
}
const formTabs = [...document.querySelectorAll('[data-tab]')];
wireTabs(formTabs, button => `panel-${button.dataset.tab}`);
wireTabs([...document.querySelectorAll('[data-segment]')], button => `segment-panel-${button.dataset.segment}`);

const context = document.getElementById('form-context');
function updateContext(form) {
  const brand = form.elements.namedItem('brand')?.value;
  const type = form.elements.namedItem('type')?.value;
  const values = [type, brand].filter(value => value && value !== 'Пока не знаю');
  context.textContent = values.length ? `Вы выбрали: ${values.join(' · ')}` : '';
  context.hidden = !values.length;
}
formTabs.forEach(button => button.addEventListener('click', () => updateContext(document.getElementById(`${button.dataset.tab}-form`))));
document.querySelectorAll('select[name=brand],select[name=type]').forEach(select => select.addEventListener('change', () => updateContext(select.form)));
document.querySelectorAll('[data-lead]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  const mode = button.dataset.lead;
  activateTabs(formTabs, formTabs.findIndex(tab => tab.dataset.tab === mode), tab => `panel-${tab.dataset.tab}`);
  const form = document.getElementById(`${mode}-form`);
  for (const [dataKey, fieldName] of [['brand','brand'],['goal','goal'],['object','type']]) {
    const field = form.elements.namedItem(fieldName);
    if (button.dataset[dataKey] && field) field.value = button.dataset[dataKey];
  }
  updateContext(form);
  if (mode === 'selection') {
    showQuizStep(button.dataset.brand || button.dataset.object || button.dataset.goal ? 0 : quizStep, true);
  } else {
    if (button.dataset.brand || button.dataset.goal) form.querySelector('.advanced-parameters').open = true;
    scrollToRequest();
    form.elements.namedItem('phone').focus({preventScroll:true});
  }
}));

function scrollToRequest() {
  if (document.getElementById('request-modal').open) { document.getElementById('request-modal').scrollTop = 0; return; }
  document.querySelector('.request-card').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}

document.querySelectorAll('[data-equipment-view]').forEach(button => button.addEventListener('click', () => {
  const table = button.dataset.equipmentView === 'table';
  document.querySelector('.equipment-grid').hidden = table;
  document.getElementById('equipment-comparison').hidden = !table;
  document.querySelectorAll('[data-equipment-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-nav');
menuButton.addEventListener('click', () => menuButton.setAttribute('aria-expanded', String(navigation.classList.toggle('is-open'))));
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.focus();
  }
});
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
  document.body.classList.toggle('mode-mobile',button.dataset.device === 'mobile');
  document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
}));

document.querySelectorAll('.dialog-close,[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
document.getElementById('copy-open').addEventListener('click', () => document.getElementById('copy-dialog').showModal());
const projects = {
  silver: {title:'ЖК «Серебро»',description:'Поставили и смонтировали 18 лифтов в ЖК «Серебро».',image:'assets/projects/silver.webp',alt:'Визуализация ЖК Серебро из портфолио ЛКС'},
  clouds: {title:'ЖК «Облака 2.0», ЖД2',description:'Поставили и смонтировали 14 лифтов в ЖК «Облака 2.0», ЖД2.',image:'assets/projects/clouds.webp',alt:'Фото ЖК Облака 2.0 ЖД2 из портфолио ЛКС'},
  yaroslavl: {title:'ЖК «Сердце Ярославля»',description:'Поставили и смонтировали 12 лифтов в ЖК «Сердце Ярославля».',image:'assets/projects/yaroslavl.webp',alt:'Визуализация ЖК Сердце Ярославля из портфолио ЛКС'},
  novotomilino: {title:'ЖК «Новотомилино»',description:'Поставили и смонтировали 12 лифтов в ЖК «Новотомилино».',image:'assets/projects/novotomilino.webp',alt:'Фото ЖК Новотомилино из портфолио ЛКС'}
};
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  document.getElementById('project-dialog-title').textContent = project.title;
  document.getElementById('project-dialog-description').textContent = project.description;
  const image = document.getElementById('project-dialog-image');
  image.src = project.image; image.alt = project.alt;
  document.getElementById('project-dialog').showModal();
}));

document.querySelector('input[type=file]').addEventListener('change', event => {
  document.getElementById('file-name').textContent = event.target.files[0]?.name || 'Выбрать файл ↗';
});
document.querySelectorAll('form').forEach(form => {
  if (form.id !== 'tz-form') return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.namedItem('name');
    name.setCustomValidity(name.value.trim() ? '' : 'Введите имя.');
    if (!name.reportValidity()) return;
    const phone = form.elements.namedItem('phone');
    if (!validatePhone(phone)) return;
    const email = form.elements.namedItem('email');
    if (!email.checkValidity()) { email.reportValidity(); return; }
    closeRequestModal();
    document.getElementById('demo-dialog').showModal();
  });
  form.elements.namedItem('name').addEventListener('input', event => event.target.setCustomValidity(''));
  form.elements.namedItem('phone').addEventListener('input', event => event.target.setCustomValidity(''));
});

const photoDialog = document.getElementById('equipment-photo-dialog');
let activeGallery = null;
let activePhoto = 0;
function showPhoto(gallery,index) {
  const items = [...gallery.querySelectorAll('[data-equipment-photo]')];
  const normalized = (index + items.length) % items.length;
  const selected = items[normalized];
  const preview = gallery.querySelector('.equipment-photo-open img');
  preview.src = selected.dataset.src; preview.alt = selected.dataset.alt;
  preview.width = Number(selected.dataset.width); preview.height = Number(selected.dataset.height);
  gallery.querySelector('.equipment-photo-caption').textContent = selected.dataset.caption;
  gallery.querySelector('.equipment-photo-source').href = selected.dataset.source;
  gallery.querySelector('.equipment-photo-open').setAttribute('aria-label',`Увеличить: ${selected.dataset.caption}`);
  items.forEach(item => item.setAttribute('aria-pressed',String(item === selected)));
  if (photoDialog.open && activeGallery === gallery) {
    activePhoto = normalized;
    document.getElementById('equipment-photo-title').textContent = selected.dataset.caption;
    const image = document.getElementById('equipment-lightbox-image');
    image.src = selected.dataset.src; image.alt = selected.dataset.alt;
    document.getElementById('equipment-lightbox-source').href = selected.dataset.source;
    document.getElementById('equipment-photo-counter').textContent = `${normalized+1} / ${items.length}`;
  }
}
document.querySelectorAll('.equipment-gallery').forEach(gallery => {
  const items = [...gallery.querySelectorAll('[data-equipment-photo]')];
  items.forEach((item,index) => item.addEventListener('click', () => showPhoto(gallery,index)));
  gallery.querySelector('.equipment-photo-open').addEventListener('click', () => {
    activeGallery = gallery;
    activePhoto = Math.max(0,items.findIndex(item => item.getAttribute('aria-pressed') === 'true'));
    photoDialog.showModal(); showPhoto(gallery,activePhoto);
  });
});
document.getElementById('equipment-photo-prev').addEventListener('click', () => showPhoto(activeGallery,activePhoto-1));
document.getElementById('equipment-photo-next').addEventListener('click', () => showPhoto(activeGallery,activePhoto+1));
photoDialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault(); showPhoto(activeGallery,activePhoto+(event.key === 'ArrowRight' ? 1 : -1));
});

const dock = document.querySelector('.mobile-dock');
if ('IntersectionObserver' in window) {
  let heroVisible = true;
  let requestVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.id === 'top') heroVisible = entry.isIntersecting;
      if (entry.target.id === 'request') requestVisible = entry.isIntersecting;
    });
    dock.hidden = heroVisible || requestVisible;
  });
  observer.observe(document.getElementById('top'));
  observer.observe(document.getElementById('request'));
}

document.querySelectorAll('[data-messenger]').forEach(button => button.addEventListener('click', () => {
  document.getElementById('messenger-title').textContent = button.dataset.messenger;
  document.getElementById('messenger-dialog').showModal();
}));

const quizForm = document.getElementById('selection-form');
const quizSteps = [...quizForm.querySelectorAll('[data-quiz-step]')];
let quizStep = 0;
const quizError = document.getElementById('quiz-error');
const quizHeight = document.getElementById('quiz-height');
const quizHeightUnit = document.getElementById('quiz-height-unit');
const quizHeightUnknown = document.getElementById('quiz-height-unknown');
const quizSummary = document.getElementById('quiz-summary-list');

function quizValue(name) { return quizForm.elements.namedItem(name)?.value || ''; }
function updateQuizHeight() {
  const floors = quizHeightUnit.value === 'floors';
  quizHeight.disabled = quizHeightUnknown.checked;
  quizHeightUnit.disabled = quizHeightUnknown.checked;
  quizHeight.min = floors ? '1' : '0.1';
  quizHeight.step = floors ? '1' : 'any';
  quizHeight.inputMode = floors ? 'numeric' : 'decimal';
  quizHeight.placeholder = floors ? 'Например, 35' : 'Например, 120';
  document.getElementById('quiz-height-label').textContent = floors ? 'Количество этажей' : 'Высота подъёма, м';
}
function updateQuizSummary() {
  const height = quizHeightUnknown.checked ? 'Пока не знаю' : quizHeight.value ? `${quizHeight.value} ${quizHeightUnit.value === 'floors' ? 'эт.' : 'м подъёма'}` : 'Не указано';
  const answers = [
    ['Здание',quizValue('type') || 'Не указано'],
    [quizHeightUnit.value === 'floors' || quizHeightUnknown.checked ? 'Этажность / высота' : 'Высота подъёма',height],
    ['Количество лифтов',quizValue('quantity') || 'Не указано'],
    ['Этап проекта',quizValue('stage') || 'Не указано']
  ];
  if (quizValue('brand')) answers.push(['Пожелания по бренду',quizValue('brand')]);
  if (quizValue('goal') !== 'Расчёт поставки и монтажа') answers.push(['С чем помочь',quizValue('goal')]);
  quizSummary.replaceChildren();
  answers.forEach(([label,value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = label;
    const detail = document.createElement('dd'); detail.textContent = value;
    row.append(term,detail); quizSummary.append(row);
  });
}
function showQuizStep(index, focus = false) {
  quizStep = Math.max(0,Math.min(quizSteps.length-1,index));
  quizSteps.forEach((step,i) => { step.hidden = i !== quizStep; });
  document.getElementById('quiz-counter').textContent = `Шаг ${quizStep+1} из ${quizSteps.length}`;
  document.getElementById('quiz-progress').setAttribute('aria-valuenow',String(quizStep+1));
  document.getElementById('quiz-progress-fill').style.width = `${(quizStep+1)/quizSteps.length*100}%`;
  document.querySelectorAll('.quiz-stages li').forEach((item,i) => {
    item.classList.toggle('is-complete',i<quizStep);
    if (i === quizStep) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current');
  });
  document.getElementById('quiz-back').hidden = quizStep === 0;
  document.getElementById('quiz-next').hidden = quizStep === quizSteps.length-1;
  document.getElementById('quiz-submit').hidden = quizStep !== quizSteps.length-1;
  document.getElementById('quiz-bottom-hint').textContent = quizStep === quizSteps.length-1 ? 'Email, файл и пожелания можно не добавлять.' : 'Если данных нет, выбирайте «Пока не знаю».';
  quizError.hidden = true;
  updateQuizHeight(); updateQuizSummary(); updateContext(quizForm);
  if (focus) {
    scrollToRequest();
    quizSteps[quizStep].querySelector('h3').focus({preventScroll:true});
  }
}
function validateQuizStep() {
  let error = '';
  let field;
  if (quizStep === 0 && !quizValue('type')) { error = 'Выберите тип здания или «Пока не знаю».'; field = quizForm.querySelector('[name=type]'); }
  if (quizStep === 1 && !quizHeightUnknown.checked) {
    const value = Number(quizHeight.value);
    const floors = quizHeightUnit.value === 'floors';
    if (!quizHeight.value || !Number.isFinite(value) || value <= 0 || (floors && !Number.isInteger(value))) {
      error = floors ? 'Укажите количество этажей целым числом или выберите «Пока не знаю».' : 'Укажите высоту подъёма в метрах или выберите «Пока не знаю».';
      field = quizHeight;
    }
  }
  if (quizStep === 2 && !quizValue('quantity')) { error = 'Выберите количество лифтов или «Пока не знаю».'; field = quizForm.querySelector('[name=quantity]'); }
  if (quizStep === 3 && !quizValue('stage')) { error = 'Выберите этап проекта или «Пока не знаю».'; field = quizForm.querySelector('[name=stage]'); }
  quizError.textContent = error; quizError.hidden = !error;
  if (error && field) field.focus({preventScroll:true});
  return !error;
}
document.getElementById('quiz-next').addEventListener('click', () => { if (validateQuizStep()) showQuizStep(quizStep+1,true); });
document.getElementById('quiz-back').addEventListener('click', () => showQuizStep(quizStep-1,true));
document.getElementById('quiz-edit').addEventListener('click', () => showQuizStep(0,true));
document.getElementById('quiz-restart').addEventListener('click', () => {
  quizForm.reset();
  quizForm.querySelectorAll('details').forEach(details => { details.open = false; });
  quizForm.elements.namedItem('phone').setCustomValidity('');
  quizForm.elements.namedItem('email').setCustomValidity('');
  document.getElementById('quiz-file-name').textContent = 'Выбрать файл ↗';
  showQuizStep(0,true);
});
quizForm.addEventListener('input', () => { quizError.hidden = true; updateQuizSummary(); });
quizForm.addEventListener('change', () => { updateQuizHeight(); updateQuizSummary(); updateContext(quizForm); quizError.hidden = true; });
quizForm.querySelector('input[type=file]').addEventListener('change',event => {
  document.getElementById('quiz-file-name').textContent = event.target.files[0]?.name || 'Выбрать файл ↗';
});
quizForm.elements.namedItem('phone').addEventListener('input',event => event.target.setCustomValidity(''));
quizForm.elements.namedItem('email').addEventListener('input',event => event.target.setCustomValidity(''));
quizForm.addEventListener('submit',event => {
  event.preventDefault();
  if (quizStep < quizSteps.length-1) {
    if (validateQuizStep()) showQuizStep(quizStep+1,true);
    return;
  }
  const phone = quizForm.elements.namedItem('phone');
  if (!validatePhone(phone)) return;
  const email = quizForm.elements.namedItem('email');
  if (!email.checkValidity()) { email.reportValidity(); return; }
  updateQuizSummary();
  closeRequestModal();
  document.getElementById('demo-dialog').showModal();
});
showQuizStep(0);
if (location.hash === '#quiz') {
  activateTabs(formTabs,formTabs.findIndex(tab => tab.dataset.tab === 'selection'),tab => `panel-${tab.dataset.tab}`);
  showQuizStep(0,true);
}

function validatePhone(field) {
  const digits = field.value.replace(/\D/g,'');
  const valid = /^[+\d\s().-]+$/.test(field.value.trim()) && digits.length >= 7 && digits.length <= 15;
  field.setCustomValidity(valid ? '' : 'Введите номер телефона (от 7 до 15 цифр).');
  if (!valid) field.reportValidity();
  return valid;
}
const quickDialog = document.getElementById('quick-contact-dialog');
const quickForm = document.getElementById('quick-contact-form');
document.getElementById('quick-contact-open').addEventListener('click', () => quickDialog.showModal());
quickForm.querySelectorAll('input').forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
quickForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = quickForm.elements.namedItem('name');
  name.setCustomValidity(name.value.trim() ? '' : 'Введите имя.');
  if (!name.reportValidity() || !validatePhone(quickForm.elements.namedItem('phone'))) return;
  quickDialog.close();
  document.getElementById('demo-dialog').showModal();
});

const requestModal = document.getElementById('request-modal');
const requestCard = document.querySelector('.request-card');
const requestHome = document.createComment('request card position');
requestCard.before(requestHome);
function restoreRequestCard() {
  if (requestCard.parentElement !== requestHome.parentElement) requestHome.after(requestCard);
}
function closeRequestModal() {
  if (!requestModal.open) return;
  restoreRequestCard();
  requestModal.close();
}
requestModal.addEventListener('close', restoreRequestCard);
document.querySelectorAll('[data-modal-lead]').forEach(button => button.addEventListener('click', () => {
  const mode = button.dataset.modalLead;
  if (mode === 'selection' && button.dataset.object) {
    quizForm.elements.namedItem('type').value = button.dataset.object;
  }
  document.getElementById('request-modal-content').append(requestCard);
  activateTabs(formTabs, formTabs.findIndex(tab => tab.dataset.tab === mode), tab => `panel-${tab.dataset.tab}`);
  if (mode === 'selection') showQuizStep(button.dataset.object ? 0 : quizStep);
  requestModal.showModal();
  if (mode === 'selection') quizSteps[quizStep].querySelector('h3').focus({preventScroll:true});
  else document.getElementById('tz-form').elements.namedItem('name').focus({preventScroll:true});
}));

const equipmentRequestDialog = document.getElementById('equipment-request-dialog');
const equipmentRequestForm = document.getElementById('equipment-request-form');
document.getElementById('equipment-request-open').addEventListener('click', () => equipmentRequestDialog.showModal());
equipmentRequestForm.querySelectorAll('input').forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
equipmentRequestForm.elements.namedItem('project').addEventListener('change', event => {
  document.getElementById('equipment-file-name').textContent = event.target.files[0]?.name || 'Выбрать файл ↗';
});
equipmentRequestForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = equipmentRequestForm.elements.namedItem('name');
  name.setCustomValidity(name.value.trim() ? '' : 'Введите имя.');
  if (!name.reportValidity() || !validatePhone(equipmentRequestForm.elements.namedItem('phone'))) return;
  equipmentRequestDialog.close();
  document.getElementById('demo-dialog').showModal();
});

const documentDialog = document.getElementById('document-dialog');
const documentCards = [...document.querySelectorAll('.document-card')];
let activeDocument = 0;
function showDocument(index) {
  activeDocument = (index + documentCards.length) % documentCards.length;
  const card = documentCards[activeDocument];
  document.getElementById('document-dialog-title').textContent = card.querySelector('h3').textContent;
  document.getElementById('document-dialog-date').textContent = card.querySelector('.document-date').textContent;
  const image = document.getElementById('document-dialog-image');
  image.src = card.querySelector('img').src;
  image.alt = card.querySelector('img').alt;
  document.getElementById('document-pdf').href = card.querySelector('a').href;
  document.getElementById('document-counter').textContent = `${activeDocument+1} / ${documentCards.length}`;
  documentDialog.scrollTop = 0;
}
documentCards.forEach((card,index) => card.querySelector('button').addEventListener('click', () => { showDocument(index); documentDialog.showModal(); }));
document.getElementById('document-prev').addEventListener('click', () => showDocument(activeDocument-1));
document.getElementById('document-next').addEventListener('click', () => showDocument(activeDocument+1));
documentDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showDocument(activeDocument+(event.key === 'ArrowRight' ? 1 : -1)); }
});
