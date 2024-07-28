import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Image } from './product.schema';
import { HydratedDocument, Types } from 'mongoose';

export type ProductVariantDocument = HydratedDocument<ProductVariant>;

@Schema({ _id: false })
export class ProductVariantAttributes {
  @Prop()
  packaging: string;

  @Prop()
  description: string;
}

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
})
export class ProductVariant {
  @Prop({ unique: true })
  id: string;

  @Prop()
  available: boolean;

  @Prop({ type: ProductVariantAttributes })
  attributes: ProductVariantAttributes;

  @Prop({ default: 'USD' })
  currency?: string;

  @Prop()
  description: string;

  @Prop()
  packaging: string;

  @Prop()
  price: number;

  @Prop()
  optionName: string;

  @Prop()
  optionsPath: string;

  @Prop()
  optionItemsPath: string;

  @Prop()
  sku: string;

  @Prop({ type: Types.Array<Image> })
  images: Image[];

  @Prop({ default: '' })
  itemCode?: string;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
