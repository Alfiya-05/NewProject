document.addEventListener('DOMContentLoaded', () => {
  // Language Toggle
  const langSwitch = document.getElementById('langSwitch');
  const langLabels = document.querySelectorAll('.lang-toggle span');

  if (langSwitch && langLabels.length > 1) {
    const updateLangStyles = (isHi) => {
      langLabels[0].classList.toggle('active-lang', !isHi);
      langLabels[1].classList.toggle('active-lang', isHi);
      langLabels[0].style.cssText = !isHi ? 'font-weight: 700; color: var(--text-dark)' : 'font-weight: 500; color: var(--text-muted)';
      langLabels[1].style.cssText = isHi ? 'font-weight: 700; color: var(--text-dark)' : 'font-weight: 500; color: var(--text-muted)';
    };
    langSwitch.addEventListener('change', (e) => updateLangStyles(e.target.checked));
    updateLangStyles(false);
  }

  // File Upload Handling
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  if (dropZone && fileInput) {
    const btn = dropZone.querySelector('.btn-outline');
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const highlight = () => dropZone.style.cssText = 'border-color: var(--primary); background: var(--primary-light)';
    const unhighlight = () => dropZone.style.cssText = 'border-color: #cbd5e1; background: var(--bg-secondary)';

    const handleFile = (file) => {
      dropZone.querySelector('h3').textContent = `File Ready: ${file.name}`;
      dropZone.querySelector('p').textContent = 'Click "Analyze" to proceed.';
      btn.textContent = 'Analyze Document';
      btn.classList.replace('btn-outline', 'btn-primary');
    };

    btn.addEventListener('click', () => fileInput.click());
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, prevent));
    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, highlight));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, unhighlight));

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function () {
      if (this.files.length) handleFile(this.files[0]);
    });
  }
});