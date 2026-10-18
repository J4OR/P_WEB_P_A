export class BaseRepository {
  constructor(collection, storage = window.localStorage) {
    this.collection = collection;
    this.storage = storage;
  }

  getAll() {
    try {
      const records = JSON.parse(this.storage.getItem(this.collection) || "[]");
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  }

  getById(id) {
    return this.getAll().find((record) => record.id === id) || null;
  }

  add(data) {
    const records = this.getAll();
    const record = { id: this.createId(), ...data };
    records.push(record);
    return this.save(records) ? record : null;
  }

  update(id, data) {
    const records = this.getAll();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, id };
    return this.save(records) ? records[index] : null;
  }

  delete(id) {
    const records = this.getAll();
    const next = records.filter((record) => record.id !== id);
    if (next.length === records.length) return false;
    return this.save(next);
  }

  search(query, fields = []) {
    const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
    if (!normalizedQuery) return this.getAll();
    return this.getAll().filter((record) => fields.some((field) =>
      String(record[field] ?? "").toLocaleLowerCase().includes(normalizedQuery)
    ));
  }

  save(records) {
    try {
      this.storage.setItem(this.collection, JSON.stringify(records));
      return true;
    } catch {
      return false;
    }
  }

  createId() {
    return globalThis.crypto?.randomUUID?.() || String(Date.now() + Math.random());
  }
}