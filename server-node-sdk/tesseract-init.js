const { createWorker } = require('tesseract.js');

(async () => {
    console.log('Initializing Tesseract... This will download language data (eng.traineddata.gz)...');
    const worker = await createWorker('eng');
    console.log('Initialization complete.');
    await worker.terminate();
})();