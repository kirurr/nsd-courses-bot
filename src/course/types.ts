import * as v from "valibot";

export type Course = v.InferOutput<typeof CourseSchema>;

export const CourseSchema = v.object({
  id: v.number(),
  title: v.string(),
  description: v.string(),
  groupId: v.string(),
  paymentLink: v.string(),
	supportLink: v.string(),
	price: v.number(),
	recieveType: v.picklist(['chat', 'direct'])
});
