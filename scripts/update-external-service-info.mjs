// scripts/update-external-service-info.mjs
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

const externalServiceConfigs = [
  {
    slug: 'mini-kohoku',
    name: 'Nicole BMW Service Centre',
    url: '/location/nicole-bmw-service-centre',
    postal: '〒224-0062',
    address: '神奈川県横浜市都筑区葛が谷15-46',
    tel: '045-948-2500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※MINI 港北にはサービス工場が併設されておりません。定期点検・車検・メンテナンスは、指定工場「Nicole BMW Service Centre」にて承ります。'
  },
  {
    slug: 'mini-tsuzuki',
    name: 'Nicole BMW 横浜港北支店',
    url: '/location/nicole-bmw-kohoku',
    postal: '〒224-0025',
    address: '神奈川県横浜市都筑区早渕3-21-28',
    tel: '045-592-2500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※MINI 都筑にはサービス工場が併設されておりません。定期点検・車検・メンテナンスは、指定工場「Nicole BMW 横浜港北支店」にて承ります。'
  },
  {
    slug: 'nicole-bmw-ota',
    name: 'Nicole BMW 本社（川崎）',
    url: '/location/nicole-bmw-kawasaki',
    postal: '〒212-0005',
    address: '神奈川県川崎市幸区戸手2-5-7',
    tel: '044-522-1500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※Nicole BMW 大田支店にはサービス工場が併設されておりません。定期点検・車検・メンテナンスは、指定工場「Nicole BMW 本社（川崎）」にて承ります。'
  },
  {
    slug: 'bps-kohoku',
    name: 'Nicole BMW Service Centre',
    url: '/location/nicole-bmw-service-centre',
    postal: '〒224-0062',
    address: '神奈川県横浜市都筑区葛が谷15-46',
    tel: '045-948-2500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※BMW Premium Selection 横浜港北にはサービス工場が併設されておりません。納車後の定期点検・車検・メンテナンスは、指定工場「Nicole BMW Service Centre」にて承ります。'
  },
  {
    slug: 'mini-next-kohoku',
    name: 'Nicole BMW Service Centre',
    url: '/location/nicole-bmw-service-centre',
    postal: '〒224-0062',
    address: '神奈川県横浜市都筑区葛が谷15-46',
    tel: '045-948-2500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※MINI NEXT 横浜港北にはサービス工場が併設されておりません。納車後の定期点検・車検・メンテナンスは、指定工場「Nicole BMW Service Centre」にて承ります。'
  },
  {
    slug: 'rolls-royce-motor-cars-yokohama',
    name: 'Nicole BMW Service Centre',
    url: '/location/nicole-bmw-service-centre',
    postal: '〒224-0062',
    address: '神奈川県横浜市都筑区葛が谷15-46',
    tel: '045-948-2500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※ロールス・ロイス・モーター・カーズ横浜ショールームにはサービス工場が併設されておりません。定期点検・整備・メンテナンスは、指定サービス拠点「Nicole BMW Service Centre」にて承ります。'
  },
  {
    slug: 'nicole-competizione-showroom',
    name: 'Nicole Competizione サービスセンター',
    url: '/location/nicole-competizione-service-centre',
    postal: '〒224-0044',
    address: '神奈川県横浜市都筑区川向町2003-6',
    tel: '045-577-3824',
    hours: '09:30 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※Nicole Competizione ショールームにはサービス工場が併設されておりません。定期点検・整備・車検は、専用ファクトリー「Nicole Competizione サービスセンター」にて承ります。'
  },
  {
    slug: 'nicole-competizione-pre-owned',
    name: 'Nicole Competizione サービスセンター',
    url: '/location/nicole-competizione-service-centre',
    postal: '〒224-0044',
    address: '神奈川県横浜市都筑区川向町2003-6',
    tel: '045-577-3824',
    hours: '09:30 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※Nicole Competizione プレオウンド ショールームにはサービス工場が併設されておりません。納車後の定期点検・整備・車検は、専用ファクトリー「Nicole Competizione サービスセンター」にて承ります。'
  },
  {
    slug: 'nicole-aoyama',
    name: 'Nicole BMW 本社サービスセンター',
    url: '/location/nicole-bmw-kawasaki',
    postal: '〒212-0005',
    address: '神奈川県川崎市幸区戸手2-5-7',
    tel: '044-522-1500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※ニコル青山ショールームにはサービス工場が併設されておりません。点検・車検・メンテナンスは、指定工場「Nicole BMW 本社サービスセンター」にて承ります。'
  },
  {
    slug: 'nicole-setagaya',
    name: 'Nicole BMW 本社サービスセンター',
    url: '/location/nicole-bmw-kawasaki',
    postal: '〒212-0005',
    address: '神奈川県川崎市幸区戸手2-5-7',
    tel: '044-522-1500',
    hours: '09:00 〜 18:00',
    closed: '水曜日（祝日を除く）',
    desc: '※ニコル世田谷ショールームにはサービス工場が併設されておりません。点検・車検・メンテナンスは、指定工場「Nicole BMW 本社サービスセンター」にて承ります。'
  }
];

const stmt = db.prepare(`
  UPDATE ec_locations 
  SET 
    external_service_name = ?,
    external_service_url = ?,
    external_service_postal = ?,
    external_service_address = ?,
    external_service_tel = ?,
    external_service_hours = ?,
    external_service_closed = ?,
    external_service_desc = ?
  WHERE slug = ?
`);

for (const c of externalServiceConfigs) {
  stmt.run(
    c.name,
    c.url,
    c.postal,
    c.address,
    c.tel,
    c.hours,
    c.closed,
    c.desc,
    c.slug
  );
}

console.log('Successfully updated external service info for all locations.');
