function buildPath(template: string, params: { [key: string]: string }) {
  let result: string = '';

  let key: string | null = null;

  for (let i = 0; i < template.length; i++) {
    if (key === null && template[i] === '{') {
      key = '';

      continue;
    }

    if (key !== null && template[i] === '}') {
      result += params[key];

      continue;
    }

    if (key !== null) {
      key += template[i];

      continue;
    }

    result += template[i];
  }

  return result;
}

test('/orgs/{org}/repos', () => {
  const result = buildPath('/orgs/{org}/repos', {
    org: 'microsoft',
  });

  console.log(result);

  expect(result).toBeTruthy();
});
