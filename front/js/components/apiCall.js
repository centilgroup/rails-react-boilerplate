export const fetchProjectData = async () => {
  const url = 'localhost:3000/jiras.json';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('There was an error retreiving your project data');
  }
  const projects = await response.json();
  return projects;
};
