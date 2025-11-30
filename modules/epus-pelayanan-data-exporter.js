// ==UserScript==
// @name         EPUS: Gabung Data Tabel
// @namespace    PKM
// @version      1.1
// @description  Gabungkan semua data tabel (support range halaman, auto set 100/page, auto download Excel)
// ==/UserScript==

(function () {
  'use strict';

 // === Filter: hanya aktif di halaman tertentu di EPUS Cirebon ===
const allowedPaths = [
  '/pelayanan',
  '/pasien',
  '/pendaftaran' // ← ganti dengan path ketiga yang kamu maksud
];

const currentPath = window.location.pathname;
const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));

if (!isAllowed) {
  return;
}

  // === Pastikan XLSX dari loader tersedia ===
  const PKM_XLSX = window.PKM?.XLSX;
  if (!PKM_XLSX) {
    console.warn('[EPUS Data Exporter] XLSX dari loader tidak tersedia.');
    return;
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));
  let allData = [];
  let headers = [];

  async function collectAllPages(fromPage = 1, toPage = null) {
    try {
      const table = document.querySelector("table");
      const tableBody = table?.querySelector("tbody");
      if (!table || !tableBody) return alert("❌ Tabel tidak ditemukan.");

      headers = [...table.querySelectorAll("thead th")].map(th => th.innerText.trim());
      allData = [];

      // set perPage = 100
      const perPageSelect = document.querySelector("select[name=limitPerPage]");
      if (perPageSelect) {
        perPageSelect.value = "100";
        perPageSelect.dispatchEvent(new Event("change", { bubbles: true }));
        await delay(1500);
      }

      // hitung total halaman
      const infoText = document.querySelector(".datatable-footer-pagination span")?.innerText || "";
      const matchTotal = infoText.match(/dari\s+(\d+)/i);
      const totalRows = matchTotal ? parseInt(matchTotal[1], 10) : null;
      const perPage = parseInt(document.querySelector("select[name=limitPerPage]")?.value || "100", 10);
      const totalPages = totalRows ? Math.ceil(totalRows / perPage) : 1;

      if (!toPage || toPage > totalPages) toPage = totalPages;

      // progress bar
      let progressContainer = document.getElementById("gabung-progress");
      if (progressContainer) progressContainer.remove();

      progressContainer = document.createElement("div");
      progressContainer.id = "gabung-progress";
      progressContainer.style = "margin:10px 0;padding:5px;border:1px solid #ccc;border-radius:5px;background:#f9f9f9;";

      const barWrapper = document.createElement("div");
      barWrapper.style = "width:100%;background:#eee;height:25px;border-radius:5px;overflow:hidden;position:relative;";

      const bar = document.createElement("div");
      bar.id = "gabung-progress-bar";
      bar.style = "height:100%;width:0;background:#28a745;font-weight:bold;text-align:center;color:white;font-size:13px;line-height:25px;transition:width 0.3s;";
      barWrapper.appendChild(bar);

      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "Batalkan";
      cancelBtn.style = "margin-top:5px;padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:3px;cursor:pointer;";
      progressContainer.appendChild(barWrapper);
      progressContainer.appendChild(cancelBtn);
      table.parentElement.insertBefore(progressContainer, table);

      let currentPage = 1;
      let canceled = false;
      cancelBtn.onclick = () => {
        canceled = true;
        bar.style.background = "#ffc107";
        bar.innerText = "Dibatalkan";
      };

      if (fromPage > 1) {
        goToPage(fromPage);
        await delay(1500);
        currentPage = fromPage;
      }

      while (currentPage <= toPage && !canceled) {
        await delay(1200);

        const rows = [...document.querySelectorAll("table tbody tr")];
        rows.forEach(row => {
          const cols = [...row.querySelectorAll("td")].map(td => td.innerText.trim());
          allData.push(cols);
        });

        const percent = Math.min(100, Math.round(((currentPage - fromPage + 1) / (toPage - fromPage + 1)) * 100));
        bar.style.width = percent + "%";
        bar.innerText = `${percent}%`;

        if (currentPage < toPage) {
          goToPage(currentPage + 1);
          currentPage++;
        } else {
          break;
        }
      }

      if (!canceled) {
        bar.style.width = "100%";
        bar.style.background = "#28a745";
        bar.innerText = `Selesai (${allData.length} baris)`;
        alert(`✅ Berhasil gabungkan ${allData.length} baris dari halaman ${fromPage}-${toPage}.`);
        downloadXLSX();
      } else {
        alert(`⏹️ Proses dibatalkan. Data terkumpul: ${allData.length} baris.`);
      }
    } catch (err) {
      console.error("❌ Gagal gabungkan ", err);
      alert("❌ Terjadi kesalahan. Cek console.");
    }
  }

  function goToPage(pageNum) {
    const target = [...document.querySelectorAll("ul.pagination li.clickable span")]
      .find(el => el.innerText.trim() == String(pageNum));
    if (target) target.click();
  }

  function downloadCSV() {
    if (!allData.length) return alert("❌ Belum ada data. Klik 'Gabungkan' dulu.");
    const csv = [headers.join(",")]
      .concat(allData.map(row => row.map(col => `"${col.replace(/"/g, '""')}"`).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data_ckg.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadXLSX() {
    if (!allData.length) return alert("❌ Belum ada data. Klik 'Gabungkan' dulu.");

    const wsData = [headers, ...allData];
    const ws = PKM_XLSX.utils.aoa_to_sheet(wsData);
    const wb = PKM_XLSX.utils.book_new();
    PKM_XLSX.utils.book_append_sheet(wb, ws, "Data");
    PKM_XLSX.writeFile(wb, "data_ckg.xlsx");
  }

  function addButtons() {
    const table = document.querySelector("table");
    if (!table || document.getElementById("gabung-data-btn")) return;

    const btn1 = document.createElement("button");
    btn1.innerText = "Gabungkan Semua Data (Range)";
    btn1.id = "gabung-data-btn";
    btn1.style = "margin:10px;padding:8px;background:#28a745;color:white;border:none;cursor:pointer;";
    btn1.onclick = () => {
      const fromPage = parseInt(prompt("Dari halaman ke berapa?", "1"), 10);
      const toPage = parseInt(prompt("Sampai halaman ke berapa? (kosong = terakhir)", ""), 10);
      collectAllPages(fromPage || 1, toPage || null);
    };

    const btn2 = document.createElement("button");
    btn2.innerText = "Unduh CSV (Manual)";
    btn2.id = "unduh-csv-btn";
    btn2.style = "margin:10px;padding:8px;background:#17a2b8;color:white;border:none;cursor:pointer;";
    btn2.onclick = downloadCSV;

    const btn3 = document.createElement("button");
    btn3.innerText = "Unduh Excel (Manual)";
    btn3.id = "unduh-excel-btn";
    btn3.style = "margin:10px;padding:8px;background:#007bff;color:white;border:none;cursor:pointer;";
    btn3.onclick = downloadXLSX;

    const container = table.parentElement;
    container.insertBefore(btn1, table);
    container.insertBefore(btn2, btn1.nextSibling);
    container.insertBefore(btn3, btn2.nextSibling);
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector("table") && !document.getElementById("gabung-data-btn")) {
      addButtons();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();