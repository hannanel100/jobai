declare module 'pdf-parse-debugging-disabled' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: Date;
    ModDate?: Date;
    Trapped?: string;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }

  interface PDFOptions {
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
    max?: number;
    version?: string;
  }

  function pdfParse(buffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  function pdfParse(buffer: Uint8Array, options?: PDFOptions): Promise<PDFData>;

  export = pdfParse;
}
