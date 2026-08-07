export interface TFIDFDocument {
  id: string;
  text: string;
  answer: string;
}

interface TermFrequency {
  [term: string]: number;
}

export class TFIDFIndex {
  private documents: TFIDFDocument[] = [];
  private idf: TermFrequency = {};

  add(doc: TFIDFDocument): void {
    this.documents.push(doc);
    this.rebuildIDF();
  }

  addBatch(docs: TFIDFDocument[]): void {
    this.documents.push(...docs);
    this.rebuildIDF();
  }

  query(text: string, topK = 1): Array<{ doc: TFIDFDocument; score: number }> {
    if (this.documents.length === 0) return [];

    const queryTerms = this.tokenize(text);
    const scores = this.documents.map(doc => ({
      doc,
      score: this.cosineSimilarity(queryTerms, this.tokenize(doc.text)),
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(r => r.score > 0);
  }

  get size(): number {
    return this.documents.length;
  }

  private tokenize(text: string): TermFrequency {
    const terms: TermFrequency = {};
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    for (const word of words) {
      terms[word] = (terms[word] ?? 0) + 1;
    }
    return terms;
  }

  private rebuildIDF(): void {
    const docCount = this.documents.length;
    const termDocs: TermFrequency = {};

    for (const doc of this.documents) {
      const terms = new Set(Object.keys(this.tokenize(doc.text)));
      for (const term of terms) {
        termDocs[term] = (termDocs[term] ?? 0) + 1;
      }
    }

    this.idf = {};
    for (const [term, count] of Object.entries(termDocs)) {
      this.idf[term] = Math.log((docCount + 1) / (count + 1)) + 1;
    }
  }

  private cosineSimilarity(a: TermFrequency, b: TermFrequency): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, tfA] of Object.entries(a)) {
      const idf = this.idf[term] ?? 0;
      const tfidfA = tfA * idf;
      const tfidfB = (b[term] ?? 0) * idf;
      dot += tfidfA * tfidfB;
      normA += tfidfA ** 2;
    }

    for (const [term, tfB] of Object.entries(b)) {
      const idf = this.idf[term] ?? 0;
      normB += (tfB * idf) ** 2;
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
