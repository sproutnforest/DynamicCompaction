// BAGIAN 1: PERHITUNGAN KEPADATAN RELATIF (Dr)
function calculateDr(method) {
    // 1. Ambil metode perhitungan yang dipilih user (Void Ratio atau Unit Weight)
    let Dr = 0;
    let classification = "";
    
    try {
        if (method === "voidRatio") {
            // Ambil input Angka Pori
            const e_max = parseFloat(document.getElementById('e_max').value);
            const e_min = parseFloat(document.getElementById('e_min').value);
            const e_field = parseFloat(document.getElementById('e_field').value);

            // Validasi Input
            if (isNaN(e_max) || isNaN(e_min) || isNaN(e_field)) {
                alert("Mohon isi semua nilai Angka Pori dengan angka valid.");
                return;
            }
            if (e_min >= e_max) {
                alert("Nilai e_min harus lebih kecil dari e_max.");
                return;
            }
            if (e_field > e_max || e_field < e_min) {
                alert("Nilai e_lapangan harus berada di antara e_min dan e_max.");
                return;
            }

            // Rumus Dr berdasarkan Void Ratio
            Dr = ((e_max - e_field) / (e_max - e_min)) * 100;

        } else if (method === "dryUnitWeight") {
            // Ambil input Berat Isi Kering (gamma)
            const gamma_d_min = parseFloat(document.getElementById('gamma_d_min').value);
            const gamma_d_max = parseFloat(document.getElementById('gamma_d_max').value);
            const gamma_d_field = parseFloat(document.getElementById('gamma_field').value);

            // Validasi Input
            if (isNaN(gamma_d_min) || isNaN(gamma_d_max) || isNaN(gamma_d_field)) {
                alert("Mohon isi semua nilai Berat Isi dengan angka valid.");
                return;
            }
            if (gamma_d_min >= gamma_d_max) {
                alert("Nilai gamma_min harus lebih kecil dari gamma_max.");
                return;
            }
            // Validasi logis tanah (tidak wajib error, tapi peringatan)
            if (gamma_d_field < gamma_d_min || gamma_d_field > gamma_d_max) {
                console.warn("Berat isi lapangan berada di luar rentang min/max laboratorium.");
            }

            // Rumus Dr berdasarkan Unit Weight
            // Dr = [ (gd - gd_min) / (gd_max - gd_min) ] * [ gd_max / gd ] * 100
            Dr = ((gamma_d_field - gamma_d_min) / (gamma_d_max - gamma_d_min)) * (gamma_d_max / gamma_d_field) * 100;
        }

        // Pembulatan hasil 2 desimal
        Dr = Math.round(Dr * 100) / 100;

        // Tentukan Klasifikasi
        if (Dr < 0) classification = "Error (Data tidak valid)";
        else if (Dr <= 15) classification = "Sangat Lepas (Very Loose)";
        else if (Dr <= 35) classification = "Lepas (Loose)";
        else if (Dr <= 65) classification = "Sedang (Medium Dense)";
        else if (Dr <= 85) classification = "Padat (Dense)";
        else if (Dr <= 100) classification = "Sangat Padat (Very Dense)";
        else classification = "Error (> 100%)";

        // Tampilkan Hasil
        document.getElementById('Dr_initial_result').innerText = Dr + " %";
        document.getElementById('Dr_initial_classification').innerText = classification;

        // Otomatis update dropdown "Derajat Kejenuhan" di Bagian 2
        autoSelectSaturation(Dr)

    } catch (error) {
        console.error("Error calculating Dr:", error);
        alert("Terjadi kesalahan perhitungan.");
    }
}

// Fungsi Helper: Mengubah dropdown "Derajat Kejenuhan" secara otomatis berdasarkan hasil Dr
function autoSelectSaturation(drValue) {
    const saturationSelect = document.getElementById('saturationLevel');
    if (!saturationSelect) return;

    if (drValue < 35) {
        saturationSelect.value = "low"; // Loose
    } else if (drValue <= 65) {
        saturationSelect.value = "medium"; // Medium
    } else {
        saturationSelect.value = "high"; // Dense
    }
    // Trigger event agar fungsi updateReferences() di HTML berjalan
    saturationSelect.dispatchEvent(new Event('change'));
}

// BAGIAN 2 & 3: PERHITUNGAN DYNAMIC COMPACTION
let diagramDrawn = false;
function calculateAreaA() {
    const soil = document.getElementById('soilType').value;
    const saturation = document.getElementById('saturationLevel').value;
    const W = parseFloat(document.getElementById('compactorWeight').value);
    const D = parseFloat(document.getElementById('areaADepth').value);
    const P = parseFloat(document.getElementById('passCount').value);
    const diameter = parseFloat(document.getElementById('compactorDiameter').value);
    let n;
    let e; //energi satuan yang diaplikasikan
    let E; 
    let WH; 
    let H; //tinggi jatuh
    let AE;
    let s; //jarak grids
    let N; //jumlah pukulan
    if(soil === "wasteFill"){ //Tempat pembuangan sampah material urugan (landfill)
        if(saturation === "medium"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.5): ", "0.4");
            e = 800;
        } else if(saturation === "high"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.4): ", "0.35");
            e = 1100;
        } else {
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.4 - 0.5): ", "0.5");
            e = 600;
        }
    } else if(soil === "granularCoarse"){ //Tanah berbutir kasar lolos air
        if(saturation === "medium"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.5 - 0.6): ", "0.5");
            e = 225;
        } else if(saturation === "high"){
            n = 0.5;
            e = 250;
        } else {
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.5 - 0.6): ", "0.6");
            e = 200;
        }
    } else if(soil === "granularFine"){//Tanah berbutir halus semi lolos air
        if(saturation === "medium"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.4): ", "0.4");
            e = 300;
        } else if(saturation === "high"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.4): ", "0.35");
            e = 350;
        } else {
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.4 - 0.5): ", "0.5");
            e = 250;
        }
    } else{ //Lapisan tanah kedap air
        if(saturation === "medium"){
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.4): ", "0.35");
            e = 800;
        } else if(saturation === "high"){
           alert("penggunaan jenis tanah ini tidak direkomendasikan!");
           return;
        } else {
            n = prompt("Masukkan nilai koefisien n yang ingin digunakan (0.35 - 0.4): ", "0.4");
            e = 600;
        }
    };
    WH = Math.pow(D/n,2);
    H = Math.round(WH/W * 10)/10;
    Hawal = H;
    E = Math.round(D*e/9.81);
    s = Math.round((diameter + (diameter*0.5) - 0.1) * 10)/10;
    N = Math.round((E*Math.pow(s, 2))/(W*H*P) * 10)/10;
    while(N>8){
        H += 1;
        N = Math.round((E*Math.pow(s, 2))/(W*H*P) * 10)/10;
    }

    Nround = Math.round(N);

    document.getElementById('appliedEnergyA').value = E;
    document.getElementById('H_initial_A').innerText = Hawal;
    
    document.getElementById('H_planned_A').innerText = H;

    document.getElementById('s_A').innerText = s;

    document.getElementById('N_A').innerText = N + " (~" + Nround + ")";

    const gridLabel = document.getElementById('display-s');
    if (gridLabel) {
        gridLabel.innerText = s;
    }

    const badgeLabel = document.getElementById('current-s');
    if (badgeLabel) {
        badgeLabel.innerText = s;
    }

    drawCompactionGrid(s);
    diagramDrawn = true;
}

// A global variable to store the current 's' for redrawing
let currentGridSpacing_s = 0;

function drawCompactionGrid(sValue) {
    const svg = document.getElementById('dynamicCompactionGrid');
    if (!svg) return; // Exit if SVG element is not found

    // Clear previous drawings
    svg.innerHTML = ''; 

    // Define SVG dimensions and grid properties
    const svgWidth = 300; // Corresponds to viewBox width
    const svgHeight = 300; // Corresponds to viewBox height
    const padding = 30;
    const gridDim = svgWidth - 2 * padding; // Usable width for the 3x3 grid
    const cellSpacing = gridDim / 2; // Distance between centers of adjacent points

    // Point radius
    const pointRadius = 10;

    // Line stroke width
    const strokeWidth = 2;
    const lineColor = "#333";
    const textColor = "#6c757d"; // A muted grey

    // Function to create SVG elements
    function createSVGElement(tag, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }

    // --- Draw the Points (Circles) ---
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cx = padding + col * cellSpacing;
            const cy = padding + row * cellSpacing;
            const circle = createSVGElement('circle', {
                cx: cx,
                cy: cy,
                r: pointRadius,
                fill: 'black'
            });
            svg.appendChild(circle);
        }
    }

    // --- Draw the Horizontal Lines ---
    for (let row = 0; row < 3; row++) {
        const y = padding + row * cellSpacing;
        const line1 = createSVGElement('line', {
            x1: padding + pointRadius,
            y1: y,
            x2: padding + cellSpacing - pointRadius,
            y2: y,
            stroke: lineColor,
            'stroke-width': strokeWidth
        });
        svg.appendChild(line1);

        const line2 = createSVGElement('line', {
            x1: padding + cellSpacing + pointRadius,
            y1: y,
            x2: padding + 2 * cellSpacing - pointRadius,
            y2: y,
            stroke: lineColor,
            'stroke-width': strokeWidth
        });
        svg.appendChild(line2);
    }

    // --- Draw the Vertical Lines ---
    for (let col = 0; col < 3; col++) {
        const x = padding + col * cellSpacing;
        const line1 = createSVGElement('line', {
            x1: x,
            y1: padding + pointRadius,
            x2: x,
            y2: padding + cellSpacing - pointRadius,
            stroke: lineColor,
            'stroke-width': strokeWidth
        });
        svg.appendChild(line1);

        const line2 = createSVGElement('line', {
            x1: x,
            y1: padding + cellSpacing + pointRadius,
            x2: x,
            y2: padding + 2 * cellSpacing - pointRadius,
            stroke: lineColor,
            'stroke-width': strokeWidth
        });
        svg.appendChild(line2);
    }

    const sTextAttributes = {
        'font-family': 'Arial, sans-serif',
        'font-size': '14px',
        fill: textColor,
        'text-anchor': 'middle'
    };

    // Horizontal 's'
    const sH_x = padding + cellSpacing / 2;
    const sH_y = padding - 10; // Slightly above the top line
    const sH = createSVGElement('text', {
        x: sH_x,
        y: sH_y,
        ...sTextAttributes
    });
    sH.textContent = 's';
    svg.appendChild(sH);

    // Vertical 's'
    const sV_x = padding - 10; // Slightly to the left of the left line
    const sV_y = padding + cellSpacing / 2 + 5; // Centered vertically
    const sV = createSVGElement('text', {
        x: sV_x,
        y: sV_y,
        ...sTextAttributes
    });
    sV.textContent = 's';
    svg.appendChild(sV);


    // --- Add the 's = [value] m' box at the bottom right ---
    const sValueText = `s = ${sValue} m`;
    const boxWidth = 100;
    const boxHeight = 30;
    const boxPadding = 5;

    // Position relative to SVG viewBox (300x300)
    const boxX = svgWidth - padding - boxWidth;
    const boxY = svgHeight - padding - boxHeight;

    const text = createSVGElement('text', {
        x: boxX + boxWidth / 2,
        y: boxY + boxHeight / 2 + 5, // Adjust for vertical alignment
        'font-family': 'Arial, sans-serif',
        'font-size': '14px',
        fill: '#212529', // Dark text color
        'text-anchor': 'middle',
        'font-weight': 'bold'
    });
    text.textContent = sValueText;
    svg.appendChild(text);

    // Store the current sValue
    currentGridSpacing_s = sValue;
}

function downloadImage() {
    const svgElement = document.getElementById('dynamicCompactionGrid');
    
    if (!diagramDrawn) {
        alert("Diagram belum dibuat. Silakan hitung Area terlebih dahulu");
        return;
    }

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    const canvas = document.createElement('canvas');
    const size = 600; 
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        ctx.drawImage(img, 0, 0, size, size);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'diagram_pemadatan_dinamik.png';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
    };

    // Trigger the load
    img.src = url;
}

// BAGIAN 5: EVALUASI PENINGKATAN KEPADATAN (TARGET GAMMA D)
function calculateTargetGammaD() {
    // Input
    const drTargetVal = parseFloat(document.getElementById('Dr_target').value);
    const gammaMin = parseFloat(document.getElementById('gamma_d_min').value);
    const gammaMax = parseFloat(document.getElementById('gamma_d_max').value);

    // Validasi
    if (isNaN(drTargetVal) || isNaN(gammaMin) || isNaN(gammaMax)) {
        alert("Pastikan nilai Dr Target, gamma_d(min), dan gamma_d(max) di Bagian 1 sudah terisi.");
        return;
    }
    if (gammaMin >= gammaMax) {
        alert("Nilai gamma_d(min) harus lebih kecil dari gamma_d(max). Cek input di Bagian 1.");
        return;
    }

    // Konversi Dr dari persen ke desimal
    const Dr = drTargetVal / 100;

    // Rumus turunan dari definisi Relative Density (Dr) untuk mencari gamma_d (field/target)
    // Dr = [ (gd - gd_min) / (gd_max - gd_min) ] * [ gd_max / gd ]
    // Hasil matematis:
    // gamma_d_target = (gamma_max * gamma_min) / (gamma_max - Dr * (gamma_max - gamma_min))
    
    const numerator = gammaMax * gammaMin;
    const denominator = gammaMax - (Dr * (gammaMax - gammaMin));
    
    let gammaTarget = numerator / denominator;

    // Pembulatan 2 desimal
    gammaTarget = Math.round(gammaTarget * 100) / 100;

    // Output
    document.getElementById('gamma_d_after').value = gammaTarget;
    
    // Update teks kesimpulan
    const conclusionText = document.getElementById('compaction_conclusion');
    conclusionText.innerHTML = `Untuk mencapai Kepadatan Relatif <strong>${drTargetVal}%</strong>, <br>
    Dynamic Compaction harus meningkatkan berat isi kering tanah menjadi minimal <strong>${gammaTarget} kN/m³</strong>.`;
}

// Fungsi untuk updateReferences jika diperlukan oleh onchange di HTML
function updateReferences() {
    // Logika tambahan jika ingin mengubah tampilan tabel referensi berdasarkan pilihan dropdown
    // Saat ini dibiarkan kosong atau bisa diimplementasikan nanti.
}

// Fungsi untuk updateCalculation jika diperlukan agar auto-recalculate saat input berubah
function updateCalculation() {
    // Opsional: Bisa memanggil calculateAreaA() otomatis
}