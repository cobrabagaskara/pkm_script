// ==UserScript==
// @name         EPUS: Gabung Data Tabel
// @namespace    PKM
// @version      1.3
// @description  Gabungkan semua data tabel (support range halaman, auto set 100/page, auto download Excel)
// ==/UserScript==

(function () {
  'use strict';

  // === Filter domain ===
  if (!window.location.hostname.endsWith('epuskesmas.id')) return;

  // === Filter path ===
  const allowedPaths = ['/pelayanan', '/pasien', '/pendaftaran'];
  const currentPath = window.location.pathname;
  const isPathAllowed = allowedPaths.some(path => currentPath.startsWith(path));
  if (!isPathAllowed) return;

  // === Pastikan XLSX dari loader tersedia ===
  const PKM_XLSX = window.PKM?.XLSX;
  if (!PKM_XLSX) {
    console.warn('[EPUS Data Exporter] XLSX dari loader tidak tersedia.');
    return;
  }

  // === Fungsi utilitas ===
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // === Logika utama ===
  let allData = [];
  let headers = [];

  async function collectAllPages(fromPage = 1, toPage = null) {
    try {
      const table = document.querySelector("table");
      const tableBody = table?.querySelector("tbody");
      if (!table || !tableBody) return alert("❌ Tabel tidak ditemukan.");

      headers = [...table.querySelectorAll("thead th")].map(th => th.innerText.trim());
      allData = [];

      const perPageSelect = document.querySelector("select[name=limitPerPage]");
      if (perPageSelect) {
        perPageSelect.value = "100";
        perPageSelect.dispatchEvent(new Event("change", { bubbles: true }));
        await delay(1500);
      }

      const infoText = document.querySelector(".datatable-footer-pagination span")?.innerText || "";
      const matchTotal = infoText.match(/dari\s+(\d+)/i);
      const totalRows = matchTotal ? parseInt(matchTotal[1], 10) : null;
      const perPage = parseInt(document.querySelector("select[name=limitPerPage]")?.value || "100", 10);
      const totalPages = totalRows ? Math.ceil(totalRows / perPage) : 1;

      if (!toPage || toPage > totalPages) toPage = totalPages;

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
      console.error("❌ Gagal gabungkan data:", err);
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

  // === UI PANEL DRAGGABLE ===
  function createDraggablePanel() {
    if ($('#epusDataPanelContainer').length) return;

    const container = $(`
      <div id="epusDataPanelContainer" style="
        position: fixed; top: 20px; right: 20px; z-index: 9999999;
        background: #fff; border: 1px solid #ccc; padding: 12px; width: 280px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 3px 10px rgba(0,0,0,0.15); border-radius: 6px; cursor: move;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:10px;">
          <h4 style="margin:0; font-size:15px; color:#333;">📊 EPUS: Ekspor Data</h4>
          <span id="closePanelBtn" style="
            cursor: pointer; font-weight: bold; color: #666;
            width: 22px; height: 22px; display: flex; align-items: center;
            justify-content: center; border-radius: 50%; background: #f0f0f0;
            font-size:14px;
          ">✕</span>
        </div>
        <button id="gabungBtn" style="
          width:100%; padding:8px; background:#28a745; color:white; border:none;
          border-radius:4px; cursor:pointer; margin-bottom:8px;
        ">Gabungkan Semua Data (Range)</button>
        <button id="csvBtn" style="
          width:100%; padding:8px; background:#17a2b8; color:white; border:none;
          border-radius:4px; cursor:pointer; margin-bottom:6px;
        ">Unduh CSV (Manual)</button>
        <button id="excelBtn" style="
          width:100%; padding:8px; background:#007bff; color:white; border:none;
          border-radius:4px; cursor:pointer;
        ">Unduh Excel (Manual)</button>
      </div>
    `);

    // Draggable logic
    let isDragging = false;
    let offsetX, offsetY;

    container.on('mousedown', (e) => {
      if (e.target.closest('#closePanelBtn')) return;
      isDragging = true;
      offsetX = e.pageX - container.offset().left;
      offsetY = e.pageY - container.offset().top;
      container.css('cursor', 'grabbing');
    });

    $(document).on('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.pageX - offsetX;
      const y = e.pageY - offsetY;
      container.css({ left: x, top: y, right: 'auto' });
    });

    $(document).on('mouseup', () => {
      isDragging = false;
      container.css('cursor', 'move');
    });

    // Tombol aksi
    container.find('#gabungBtn').on('click', () => {
      const fromPage = parseInt(prompt("Dari halaman ke berapa?", "1"), 10);
      const toPage = parseInt(prompt("Sampai halaman ke berapa? (kosong = terakhir)", ""), 10);
      collectAllPages(fromPage || 1, toPage || null);
    });

    container.find('#csvBtn').on('click', downloadCSV);
    container.find('#excelBtn').on('click', downloadXLSX);

    // Tutup panel
    container.find('#closePanelBtn').on('click', () => {
      container.remove();
      createReopenButton();
    });

    $('body').append(container);
  }

  // === Tombol sembunyi untuk buka lagi ===
  function createReopenButton() {
    if ($('#reopenEpusPanel').length) return;

    const btn = $(`
      <button id="reopenEpusPanel" style="
        position: fixed; bottom: 20px; right: 20px; z-index: 9999998;
        background: #28a745; color: white; border: none; border-radius: 20px;
        width: 40px; height: 40px; font-size: 18px; cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">📊</button>
    `);

    btn.on('click', () => {
      btn.remove();
      createDraggablePanel();
    });

    $('body').append(btn);
  }

  // === Auto-inject panel saat tabel muncul ===
  const observer = new MutationObserver(() => {
    if (document.querySelector("table") && !$('#epusDataPanelContainer').length && !$('#reopenEpusPanel').length) {
      createDraggablePanel();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
