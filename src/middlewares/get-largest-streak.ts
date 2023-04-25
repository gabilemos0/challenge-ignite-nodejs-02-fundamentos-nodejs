export function getLargestStreak(meals: any[]) {
  let currentSequence = 0
  let maxSequence = 0

  const sortedMeals = meals.sort(
    (mealA, mealB) =>
      new Date(mealA.date).getTime() - new Date(mealB.date).getTime(),
  )

  for (const meal of sortedMeals) {
    if (meal.is_in_diet) {
      currentSequence++
    } else {
      currentSequence = 0
    }
    if (currentSequence > maxSequence) {
      maxSequence = currentSequence
    }
  }

  return maxSequence
}
