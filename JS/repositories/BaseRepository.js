export class BaseRepository {
  constructor(ModelClass, storage = globalThis.localStorage) {
    this.ModelClass = ModelClass;
    this.collection = ModelClass.collection;
    this.storage = storage;
  }

  getAll() {
    try {
      const data = JSON.parse(this.storage.getItem(this.collection) || "[]");
      return Array.isArray(data)
        ? data.map((item) => new this.ModelClass(item))
        : [];
    } catch {
      return [];
    }
  }

  save(records) {
    try {
      this.storage.setItem(this.collection, JSON.stringify(records));
      return true;
    } catch {
      return false;
    }
  }

  add(data) {
    const record = new this.ModelClass(data);
    record.id = Date.now().toString();
    return this.save([...this.getAll(), record]) ? record : null;
  }

  getById(id) {
    return this.getAll().find((record) => record.id === String(id)) || null;
  }

  update(id, data) {
    const records = this.getAll(),
      index = records.findIndex((record) => record.id === String(id));
    if (index === -1) return null;
    records[index] = new this.ModelClass({
      ...records[index],
      ...data,
      id: String(id),
    });
    return this.save(records) ? records[index] : null;
  }

  delete(id) {
    const records = this.getAll(),
      remaining = records.filter((record) => record.id !== String(id));
    return remaining.length !== records.length && this.save(remaining);
  }
}
