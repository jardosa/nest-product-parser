import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductImportDocument = HydratedDocument<ProductImports>;

@Schema({ timestamps: true })
export class ProductImports {
  @Prop({ unique: true })
  name: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const ProductImportsSchema =
  SchemaFactory.createForClass(ProductImports);
