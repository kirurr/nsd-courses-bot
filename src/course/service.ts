import type { ContextWithData } from "../scenes/scenes.js";
import type { Course } from "./types.js";
import { getCourseById as dbGetCourseById } from "./repository.js";

export async function getCourseById(
  ctx: ContextWithData,
  id: number,
): Promise<Course> {
  let course: Course;
  try {
    if (ctx.session && ctx.session.courses) {
      const findedCourse = ctx.session.courses?.find(
        (course) => course.id === id,
      );

      if (findedCourse) {
        course = findedCourse;
      } else {
        throw new Error("failed to find course in session");
      }
    } else {
      throw new Error("failed to find course in session");
    }
  } catch (err: unknown) {
    const apiCourse = await dbGetCourseById(id);

    if (!apiCourse) {
      throw new Error("course action: failed to get api course");
    }

    course = apiCourse;
  }

  return course;
}
