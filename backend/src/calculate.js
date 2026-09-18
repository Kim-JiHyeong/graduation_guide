export function calculateStatus(requirements, courses) {
  const categoryTotals = new Map(
    requirements.categories.map((c) => [c.id, 0])
  );

  let totalCompletedCredits = 0;

  for (const course of courses) {
    const credits = Number(course.credits) || 0;
    totalCompletedCredits += credits;
    if (categoryTotals.has(course.categoryId)) {
      categoryTotals.set(
        course.categoryId,
        categoryTotals.get(course.categoryId) + credits
      );
    }
  }

  const categories = requirements.categories.map((c) => {
    const completed = categoryTotals.get(c.id) || 0;
    const remaining = Math.max(c.creditsRequired - completed, 0);
    return {
      id: c.id,
      name: c.name,
      required: c.creditsRequired,
      completed,
      remaining,
      isSatisfied: completed >= c.creditsRequired,
    };
  });

  // 졸업자격인증제: 4개 영역 중 1개 영역만 100점 이상 충족하면 됨 (여러 영역 합산 불가)
  const nonSubjectRequirements = requirements.nonSubjectRequirements.map(
    (r) => ({
      ...r,
      remainingScore: Math.max(100 - r.score, 0),
      isSatisfied: r.score >= 100,
    })
  );
  const certificationSatisfied = nonSubjectRequirements.some(
    (r) => r.isSatisfied
  );

  const totalRemaining = Math.max(
    requirements.totalCreditsRequired - totalCompletedCredits,
    0
  );

  const takenCourseNames = new Set(
    courses.map((c) => (c.name || "").trim()).filter(Boolean)
  );

  const requiredCourses = (requirements.requiredCourses || []).map((rc) => ({
    ...rc,
    isTaken: takenCourseNames.has(rc.name.trim()),
  }));

  const isGraduationReady =
    totalCompletedCredits >= requirements.totalCreditsRequired &&
    categories.every((c) => c.isSatisfied) &&
    certificationSatisfied &&
    requiredCourses.every((rc) => rc.isTaken);

  return {
    department: requirements.department,
    admissionYear: requirements.admissionYear,
    totalCredits: {
      required: requirements.totalCreditsRequired,
      completed: totalCompletedCredits,
      remaining: totalRemaining,
      isSatisfied: totalCompletedCredits >= requirements.totalCreditsRequired,
    },
    categories,
    requiredCourses,
    nonSubjectRequirements,
    certificationSatisfied,
    isGraduationReady,
  };
}
