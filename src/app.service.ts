import { Injectable } from '@nestjs/common';
import { parse } from 'papaparse';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async buildDataFromRow(row: Row) {
    // console.log({ row });
  }

  async executeParse() {
    const absolutePath = path.join(__dirname, '..', 'static', 'images41.txt');
    const readStream = fs.createReadStream(absolutePath);
    console.log(__dirname);

    parse<Row>(readStream, {
      header: true,
      download: true,
      chunk: async (chunk) => {
        for await (const row of chunk.data) {
          console.log(row.ProductID);
          // this.buildDataFromRow(row);
        }
      },
      chunkSize: 100,

      // step: async function (row) {
      //   console.log('Row:', row.data);
      // },
      // step: async (row) => {
      //   await this.buildDataFromRow(row.data);
      // },
      complete: function () {
        console.log('All done!');
      },
    });
  }
}

export interface Row {
  SiteSource: string;
  ItemID: string;
  ManufacturerID: string;
  ManufacturerCode: string;
  ManufacturerName: string;
  ProductID: string;
  ProductName: string;
  ProductDescription: string;
  ManufacturerItemCode: string;
  ItemDescription: string;
  ImageFileName: string;
  ItemImageURL: string;
  NDCItemCode: string;
  PKG: string;
  UnitPrice: string;
  QuantityOnHand: string;
  PriceDescription: string;
  Availability: string;
  PrimaryCategoryID: string;
  PrimaryCategoryName: string;
  SecondaryCategoryID: string;
  SecondaryCategoryName: string;
  CategoryID: string;
  CategoryName: string;
  IsRX: string;
  IsTBD: string;
}
