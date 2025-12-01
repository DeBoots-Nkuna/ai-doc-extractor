"use strict";
document.addEventListener('DOMContentLoaded', () => {
    var _a;
    const statusEl = document.getElementById('status');
    const personCard = document.getElementById('person-card');
    const qualSection = document.getElementById('qualifications-section');
    const qualBody = document.getElementById('qualifications-body');
    const qualCount = document.getElementById('qual-count');
    const downloadBtn = document.getElementById('download-csv-btn');
    if (!statusEl || !personCard || !qualSection || !qualBody || !qualCount) {
        return;
    }
    const raw = localStorage.getItem('docAnalysis');
    if (!raw) {
        statusEl.textContent =
            'No analysis data found. Please upload and analyze a document on the home page first.';
        return;
    }
    let stored;
    try {
        stored = JSON.parse(raw);
    }
    catch (_b) {
        statusEl.textContent = 'Could not read saved summary data.';
        return;
    }
    console.log('SUMMARY PAGE – LOADED FROM LOCALSTORAGE:', stored);
    const data = stored.fields
        ? Object.assign({ documentType: stored.documentType, rawText: stored.rawText }, stored.fields) : stored;
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const qualifications = Array.isArray(data.qualifications)
                    ? data.qualifications
                    : [];
                const payload = {
                    rawText: (_a = data.rawText) !== null && _a !== void 0 ? _a : '',
                    qualifications,
                    // 🔽 candidate overview fields
                    fullNames: (_b = data.fullNames) !== null && _b !== void 0 ? _b : null,
                    firstName: (_c = data.firstName) !== null && _c !== void 0 ? _c : null,
                    surname: (_d = data.surname) !== null && _d !== void 0 ? _d : null,
                    dateOfBirth: (_e = data.dateOfBirth) !== null && _e !== void 0 ? _e : null,
                    enrolmentNumber: (_g = (_f = data.enrolmentNumber) !== null && _f !== void 0 ? _f : data.enrolmentNo) !== null && _g !== void 0 ? _g : null,
                    documentType: (_h = data.documentType) !== null && _h !== void 0 ? _h : null,
                };
                const res = await fetch('/api/export-qualifications-csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    alert('Failed to generate CSV file.');
                    return;
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document_summary.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
            catch (err) {
                console.error(err);
                alert('An error occurred while downloading the CSV.');
            }
        });
    }
    statusEl.classList.add('hidden');
    //Candidate overview
    personCard.classList.remove('hidden');
    const fullNameEl = document.getElementById('field-fullName');
    const dobEl = document.getElementById('field-dob');
    const enrolEl = document.getElementById('field-enrolment');
    const docTypeEl = document.getElementById('field-docType');
    if (fullNameEl) {
        fullNameEl.textContent = data.fullNames || data.firstName || 'Not provided';
    }
    if (dobEl) {
        dobEl.textContent = data.dateOfBirth || 'Not provided';
    }
    if (enrolEl) {
        enrolEl.textContent =
            data.enrolmentNumber || data.enrolmentNo || 'Not provided';
    }
    if (docTypeEl) {
        docTypeEl.textContent = data.documentType || 'Unknown';
    }
    //Qualifications table
    const qualifications = Array.isArray(data.qualifications)
        ? data.qualifications
        : Array.isArray((_a = data.fields) === null || _a === void 0 ? void 0 : _a.qualifications)
            ? data.fields.qualifications
            : [];
    qualSection.classList.remove('hidden');
    if (!qualifications.length) {
        qualBody.innerHTML =
            '<tr><td colspan="7" class="px-3 py-3 text-center text-slate-400">No qualifications were detected in this document.</td></tr>';
        qualCount.textContent = '0 qualifications found';
        return;
    }
    qualCount.textContent =
        qualifications.length +
            ' qualification' +
            (qualifications.length > 1 ? 's' : '') +
            ' found';
    qualifications.forEach((q, index) => {
        const tr = document.createElement('tr');
        const modulesText = Array.isArray(q.modules) && q.modules.length ? q.modules.join('; ') : '—';
        tr.innerHTML = `
      <td class="px-3 py-2 align-top text-xs text-slate-400">
        ${index + 1}
      </td>
      <td class="px-3 py-2 align-top font-medium text-slate-100">
        ${q.title || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.level || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.awardingBody || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.country || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.awardedDate || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${modulesText}
      </td>
    `;
        qualBody.appendChild(tr);
    });
});
