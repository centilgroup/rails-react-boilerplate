const formattedTime = (timeInMinutes) => {
  let displayTime = timeInMinutes;
  let unit = 'minute';
  if (displayTime >= 60) {
    displayTime = Math.floor(timeInMinutes / 60);
    unit = 'hour';
  }
  if (displayTime >= 24) {
    displayTime = Math.floor(timeInMinutes / (60 * 24));
    unit = 'day';
  }
  if (displayTime >= 7) {
    displayTime = Math.floor(timeInMinutes / (60 * 24 * 7));
    unit = 'week';
  }
  if (displayTime >= 5) {
    displayTime = Math.floor(timeInMinutes / (60 * 24 * 7 * 5));
    unit = 'month';
  }
  if (displayTime >= 12) {
    displayTime = Math.floor(timeInMinutes / (60 * 24 * 7 * 5 * 12));
    unit = 'year';
  }

  if (displayTime > 1) {
    unit += 's';
  }

  return `${displayTime} ${unit}`;
};

export default formattedTime;
