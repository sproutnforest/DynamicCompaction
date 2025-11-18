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
            n = 0.4;
            e = 800;
        } else if(saturation === "high"){
            n = 0.35;
            e = 1100;
        } else {
            n = 0.5;
            e = 600;
        }
    } else if(soil === "granularCoarse"){ //Tanah berbutir kasar lolos air
        if(saturation === "medium"){
            n = 0.5;
            e = 225;
        } else if(saturation === "high"){
            n = 0.5;
            e = 250;
        } else {
            n = 0.6;
            e = 200;
        }
    } else if(soil === "granularFine"){//Tanah berbutir halus semi lolos air
        if(saturation === "medium"){
            n = 0.4;
            e = 300;
        } else if(saturation === "high"){
            n = 0.35;
            e = 350;
        } else {
            n = 0.5;
            e = 250;
        }
    } else{ //Lapisan tanah kedap air
        if(saturation === "medium"){
            n = 0.35;
            e = 800;
        } else if(saturation === "high"){
           alert("penggunaan jenis tanah ini tidak direkomendasikan!");
           return;
        } else {
            n = 0.4;
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