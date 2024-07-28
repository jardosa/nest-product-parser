import { Module } from '@nestjs/common';
import { ProductsService } from './providers/services/products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import {
  Manufacturer,
  ManufacturerSchema,
} from './schemas/manufacturer.schema';
import { ManufacturerService } from './providers/services/manufacturer.service';
import {
  ProductImports,
  ProductImportsSchema,
} from './schemas/product-imports.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductImports.name, schema: ProductImportsSchema },
      { name: Manufacturer.name, schema: ManufacturerSchema },
    ]),
  ],
  exports: [ProductsService],
  controllers: [ProductsController],
  providers: [ProductsService, ManufacturerService],
})
export class ProductsModule { }
