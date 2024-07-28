import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Manufacturer,
  ManufacturerDocument,
} from '../../schemas/manufacturer.schema';
import { Row } from './products.service';
import { nanoid } from 'nanoid';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel(Manufacturer.name)
    private manufacturerModel: Model<ManufacturerDocument>,
  ) {
    this.manufacturerModel = manufacturerModel;
  }

  async createOrReturnDocument(row: Row): Promise<ManufacturerDocument> {
    const document = await this.manufacturerModel.findOne({
      manufacturerCode: row.ManufacturerCode,
    });
    if (!document) {
      const newDocument = await this.manufacturerModel.create({
        manufacturerId: nanoid(),
        name: row.ManufacturerName,
        manufacturerCode: row.ManufacturerCode,
      });

      return newDocument;
    }

    return document;
  }
}
