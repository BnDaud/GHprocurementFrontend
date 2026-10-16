// Turns a piece of the page into a PDF, drawn from what is on screen so it looks the same.
// html2canvas and jsPDF are loaded only when a download is asked for.
const A4W = 595.28;

const loadImage = (src) =>
  new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });

// element: a DOM element (already in the document); mark: URL of the faint watermark image
export async function elementToPdf(element, { filename, background = "#ffffff", mark, markAlpha = 0.07, width }) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: background,
    width,
    windowWidth: width,
    height: element === element.ownerDocument.body ? Math.max(element.scrollHeight, element.ownerDocument.documentElement.scrollHeight) : element.scrollHeight,
  });
  const markImg = mark ? await loadImage(mark) : null;

  // one page as long as the content (nothing is cut in half); only a very long one is split into A4 pages
  const fit = A4W / canvas.width;
  const whole = canvas.height * fit <= 14000;
  const pdf = new jsPDF({ unit: "pt", format: whole ? [A4W, canvas.height * fit] : "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const sliceH = whole ? canvas.height : Math.floor(pageH / fit);
  const rgb = (background.startsWith("#")
    ? [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16))
    : (background.match(/\d+/g) || [255, 255, 255]).slice(0, 3).map(Number));

  for (let y = 0, page = 0; y < canvas.height; y += sliceH, page += 1) {
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = Math.min(sliceH, canvas.height - y);
    const ctx = part.getContext("2d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, part.width, part.height);
    ctx.drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
    if (markImg) {
      const w = part.width * 0.62;
      const h = (w * markImg.height) / markImg.width;
      ctx.save();
      ctx.globalAlpha = markAlpha;
      ctx.translate(part.width / 2, sliceH / 2);
      ctx.rotate((-22 * Math.PI) / 180);
      ctx.drawImage(markImg, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    if (page > 0) pdf.addPage();
    pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
    pdf.rect(0, 0, pageW, pageH, "F");
    pdf.addImage(part.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, part.height * fit);
  }
  pdf.save(filename);
}

// an email's HTML, drawn in a hidden frame (no scripts can run in it), then saved as a PDF
export async function emailHtmlToPdf(markup, { filename, mark }) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:700px;height:1000px;border:0;visibility:hidden";
  document.body.appendChild(frame);
  try {
    await new Promise((resolve) => {
      frame.onload = resolve;
      frame.srcdoc = markup;
    });
    const doc = frame.contentDocument;
    await Promise.all([...doc.images].map((img) => (img.complete ? null : new Promise((res) => { img.onload = res; img.onerror = res; }))));
    await elementToPdf(doc.body, {
      filename,
      mark,
      width: 700,
      background: getComputedStyle(doc.body).backgroundColor || "#ffffff",
    });
  } finally {
    frame.remove();
  }
}
