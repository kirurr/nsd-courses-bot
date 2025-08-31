import { LibsqlError } from "@libsql/client";
import { DatabaseError, ValidationError } from "../errors.js";
import { db } from "../libsql.js";
import { CourseSchema, type Course } from "./types.js";
import * as v from "valibot";

const coursesSchema = v.array(CourseSchema);

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const response = await db.execute({
      sql: "SELECT * FROM course WHERE id = ?",
      args: [id],
    });

    const course = response.rows[0];
    if (!course) {
      return null;
    }

    const output = v.safeParse(CourseSchema, {
      id: course.id,
      title: course.title,
      description: course.description,
      groupId: course.group_id,
      paymentLink: course.payment_link,
			supportLink: course.support_link
    });

    if (output.success) {
      return output.output;
    }
    throw new ValidationError(output.issues.toString());
  } catch (err: unknown) {
    console.error("failed to get course by id");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}
export async function getCourses(): Promise<Course[]> {
  try {
    const response = await db.execute("SELECT * FROM course");

    const output = v.safeParse(
      coursesSchema,
      response.rows.map((course) => {
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          groupId: course.group_id,
          paymentLink: course.payment_link,
					supportLink: course.support_link
        };
      }),
    );
    if (output.success) {
      return output.output;
    }
    throw new ValidationError(output.issues.toString());
  } catch (err: unknown) {
    console.error("failed to get courses");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}
