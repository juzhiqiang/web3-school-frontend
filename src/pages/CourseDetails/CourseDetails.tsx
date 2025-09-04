  const hasEnoughBalance = () => {
    if (!ydBalance || !courseData) return false
    return parseFloat(ydBalance) >= parseFloat(courseData.price)
  }