export class EasyApi {
  constructor() {
    console.log("EasyApi constructor");
  }
  public async fetch(): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("fetch data");
      }, 1000);
    });
  }
}
