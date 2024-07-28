import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductOption } from './product-option.schema';
import { ProductVariant } from './product-variant.schema';

export type ProductDocument = HydratedDocument<Product>;
export type Availability =
  | '0'
  | '1-3-days'
  | '1-7-days'
  | '14-21-days'
  | 'drop-ship-only'
  | 'mfr-direct'
  | 'stock-item'
  | 'vital-signs-monitors';

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
})
export class Product {
  @Prop({ index: true, unique: true })
  productId: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  // @Prop()
  // vendorId: string;

  @Prop()
  manufacturerId: string;

  @Prop()
  availability: string;

  @Prop({ type: Types.Array<ProductVariant>, default: [] })
  variants?: ProductVariant[];

  @Prop({ type: Types.Array<ProductOption>, default: [] })
  options?: ProductOption[];

  // @Prop()
  // isFragile?: boolean;

  // @Prop()
  // published: string;

  // @Prop()
  // isTaxable?: boolean;

  @Prop({ type: Types.Array<Image> })
  images: Image[];
}

@Schema({ _id: false })
export class Image {
  @Prop({ default: '' })
  fileName?: string;

  @Prop({ default: null })
  cdnLink?: string;

  @Prop({ default: 0 })
  i?: number;

  @Prop({ default: null })
  alt?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
