async function verify() {
  console.log('--- Verifying /magazine ---');
  const magRes = await fetch('http://localhost:4321/magazine');
  console.log('/magazine status:', magRes.status);
  const magHtml = await magRes.text();
  console.log('Contains THE ALL-NEW BMW iX4.:', magHtml.includes('THE ALL-NEW BMW iX4.'));
  console.log('Contains /uploads/ix4/key-visual.jpg:', magHtml.includes('/uploads/ix4/key-visual.jpg'));
  console.log('Contains 2027_new_bmw_ix4_neue_klasse:', magHtml.includes('2027_new_bmw_ix4_neue_klasse'));

  console.log('\n--- Verifying /magazine/2027_new_bmw_ix4_neue_klasse/ ---');
  const detailRes = await fetch('http://localhost:4321/magazine/2027_new_bmw_ix4_neue_klasse/');
  console.log('detail status:', detailRes.status);
  const detailHtml = await detailRes.text();
  console.log('Contains iX4 M60 xDrive:', detailHtml.includes('iX4 M60 xDrive'));
  console.log('Contains ext-01.jpg:', detailHtml.includes('ext-01.jpg'));
  console.log('Contains ext-10.jpg:', detailHtml.includes('ext-10.jpg'));
  console.log('Contains int-01.jpg:', detailHtml.includes('int-01.jpg'));
  console.log('Contains int-05.jpg:', detailHtml.includes('int-05.jpg'));
  console.log('Contains specs table:', detailHtml.includes('612 hp') && detailHtml.includes('875 Nm'));
  console.log('Contains FAQ:', detailHtml.includes('Q1: 新型BMW iX4の日本国内での充電インフラ対応') || detailHtml.includes('よくあるご質問'));
  console.log('Contains Debrecen factory:', detailHtml.includes('ハンガリー・デブレツェン新工場'));
  console.log('Contains Nicole BMW:', detailHtml.includes('Nicole BMW 本社ショールーム'));

  console.log('\n--- Verifying /posts/2027_new_bmw_ix4_neue_klasse/ ---');
  const postRes = await fetch('http://localhost:4321/posts/2027_new_bmw_ix4_neue_klasse/');
  console.log('post status:', postRes.status);
  const postHtml = await postRes.text();
  console.log('Post contains iX4 title:', postHtml.includes('新型BMW iX4登場'));
  console.log('Post contains key-visual.jpg:', postHtml.includes('key-visual.jpg'));
  console.log('Post contains specs:', postHtml.includes('612 hp'));
}
verify();
