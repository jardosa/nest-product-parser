import { Injectable, Logger } from '@nestjs/common';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { parse } from 'papaparse';
import * as path from 'path';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Model } from 'mongoose';
import { ManufacturerService } from './manufacturer.service';
import { ProductVariant } from 'src/products/schemas/product-variant.schema';
import { Chance } from 'chance';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ProductImportDocument,
  ProductImports,
} from 'src/products/schemas/product-imports.schema';

const chance = new Chance();

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductImports.name)
    private productImportsModel: Model<ProductImportDocument>,
    private readonly manufacturerService: ManufacturerService,
  ) {
    this.productModel = productModel;
  }

  async buildProductVariant(
    row: Row,
    product?: Product,
    pkgItemId?: string,
    descriptionItemId?: string,
  ): Promise<Partial<ProductVariant>> {
    const optionsPath = product.options
      .reduce((acc: string[], curr) => acc.concat(curr.id), [])
      .join('.');

    return {
      id: row.ItemID,
      itemCode: row.NDCItemCode,
      images: [
        {
          cdnLink: row.ItemImageURL,
          alt: row.ImageFileName,
          fileName: row.ImageFileName,
          i: 0,
        },
      ],
      sku: `${row.ItemID}${row.ProductID}${row.PKG}`,
      available: true,
      price: parseFloat(row.UnitPrice),
      description: row.ItemDescription,
      optionName: `${row.PKG}, ${row.ItemDescription}`,
      optionsPath,
      optionItemsPath: this.getOptionItemsPath(
        row,
        product,
        pkgItemId,
        descriptionItemId,
      ),
      // optionItemsPath: `${pkgItemId}.${descriptionItemId}`,
    };
  }

  async buildDataFromRow(row: Row): Promise<void> {
    const existingProduct = await this.productModel.findOne({
      productId: row.ProductID,
    });

    // IF PRODUCT EXISTS

    if (existingProduct) {
      const pkgItemId = chance.string({
        alpha: true,
        length: 6,
        casing: 'lower',
      });
      const descriptionItemId = chance.string({
        alpha: true,
        length: 6,
        casing: 'lower',
      });
      const variant = await this.buildProductVariant(
        row,
        existingProduct,
        pkgItemId,
        descriptionItemId,
      );
      await existingProduct.updateOne(
        {
          $push: {
            variants: variant,
          },
          $addToSet: {
            'options.$[opt].values': {
              id: pkgItemId,
              name: row.PKG,
              value: row.PKG,
            },
            'options.$[opt2].values': {
              id: descriptionItemId,
              name: row.ItemDescription,
              value: row.ItemDescription,
            },
          },
        },
        {
          arrayFilters: [
            {
              'opt.name': 'packaging',
              'opt.values.name': { $ne: row.PKG },
            },
            {
              'opt2.name': 'description',
            },
          ],
        },
      );

      return;
    }

    // NEW PRODUCT
    const pkgOptionId = chance.string({
      alpha: true,
      length: 6,
      casing: 'lower',
    });
    const descriptionOptionId = chance.string({
      alpha: true,
      length: 6,
      casing: 'lower',
    });
    const pkgOptionItemId = chance.string({
      alpha: true,
      length: 6,
      casing: 'lower',
    });
    const descriptionOptionItemId = chance.string({
      alpha: true,
      length: 6,
      casing: 'lower',
    });
    const payload: Product = {
      name: row.ProductName,
      productId: row.ProductID,
      description: row.ProductDescription,
      shortDescription: row.ProductDescription,
      manufacturerId: (
        await this.manufacturerService.createOrReturnDocument(row)
      ).manufacturerId,
      availability: row.Availability,
      images: [
        {
          fileName: row.ImageFileName,
          cdnLink: row.ItemImageURL,
        },
      ],
      options: [
        {
          id: pkgOptionId,
          name: 'packaging',
          values: [
            {
              id: pkgOptionItemId,
              name: row.PKG,
              value: row.PKG,
            },
          ],
        },
        {
          id: descriptionOptionId,
          name: 'description',
          values: [
            {
              id: descriptionOptionItemId,
              name: row.ItemDescription,
              value: row.ItemDescription,
            },
          ],
        },
      ],
    };

    // Created product with options
    const product = await this.productModel.create(payload);

    await product.updateOne({
      variants: [
        await this.buildProductVariant(
          row,
          product,
          pkgOptionItemId,
          descriptionOptionItemId,
        ),
      ],
    });
  }

  getOptionItemsPath(
    row: Row,
    product: Product,
    pkgItemId?: string,
    descriptionItemId?: string,
  ) {
    // get packaging first
    const packaging = row.PKG;

    //get option packaging
    const optionPackaging = product.options
      .find((val) => val.name === 'packaging')
      .values.find((val) => val.name === packaging);

    // get description second
    const itemDescription = row.ItemDescription;

    const optionDescription = product.options
      .find((val) => val.name === 'description')
      .values.find((val) => val.name === itemDescription);

    return `${optionPackaging?.id || pkgItemId || ''}.${optionDescription?.id || descriptionItemId || ''}`;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async importProducts() {
    //executes parsing and saving to mongo
    await this.executeParse();

    //execute langchain
  }

  async executeParse() {
    const absolutePath = path.join(__dirname, '..', '..', '..', '..', 'static');

    const lastFile = fs.readdirSync(absolutePath).at(-1);
    const filePath = path.join(absolutePath, lastFile);

    // check if file has been imported using the productimportmodel
    const importedFile = await this.productImportsModel.findOne({
      name: lastFile,
    });
    if (importedFile) {
      this.logger.log(
        `${lastFile} has already been imported on ${importedFile.createdAt}`,
      );

      return;
    }
    const readStream = fs.createReadStream(filePath);

    parse<Row>(readStream, {
      header: true,
      download: true,
      transform: (value, field) => {
        if (field === 'PKG') {
          return value.toUpperCase();
        } else {
          return value;
        }
      },
      complete: async (results) => {
        for await (const d of results.data) {
          await this.buildDataFromRow(d);
        }
      },
    });

    this.productImportsModel.create({ name: lastFile });
    this.logger.log('Finished importing products');
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
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
