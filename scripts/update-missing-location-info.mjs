// scripts/update-missing-location-info.mjs
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

const updates = [
  {
    slug: 'nicole-bmw-kohoku',
    sales_subtitle: 'Nicole BMW 横浜港北支店',
    sales_fax: '045-592-9100',
    service_subtitle: 'Nicole BMW 横浜港北支店 サービス',
    service_fax: '045-592-9100',
    access_taxi: '横浜市営地下鉄ブルーライン「新横浜駅」または「新羽駅」よりタクシーで約10〜15分（「早渕3丁目のNicole BMWショールームまで」とお伝えください）。'
  },
  {
    slug: 'nicole-bmw-aoba-miyamae',
    sales_subtitle: 'Nicole BMW 青葉宮前支店',
    sales_fax: '044-870-8507',
    service_subtitle: 'Nicole BMW 青葉宮前支店 サービス',
    service_fax: '044-870-8507',
    access_taxi: '東急田園都市線「鷺沼駅」または「宮前平駅」タクシー乗り場より約5分（「国道246号沿い、有馬病院入口交差点横のBMWまで」とお伝えください）。'
  },
  {
    slug: 'nicole-bmw-ota',
    sales_subtitle: 'Nicole BMW 大田支店',
    sales_fax: '03-6417-1432',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '都営浅草線「馬込駅」またはJR「大森駅」山王口タクシー乗り場より約5〜8分（「環七外回り、大場坂交差点近くのNicole BMWショールームまで」とお伝えください）。'
  },
  {
    slug: 'mini-kohoku',
    sales_subtitle: 'MINI 港北',
    sales_fax: '045-482-3289',
    service_subtitle: null,
    service_fax: null,
    access_taxi: 'JR・横浜市営地下鉄「新横浜駅」北口タクシー乗り場より約10分（「第三京浜港北IC近く、折本町のMINI港北ショールームまで」とお伝えください）。'
  },
  {
    slug: 'mini-tsuzuki',
    sales_subtitle: 'MINI 都筑',
    sales_fax: '045-590-5031',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '横浜市営地下鉄ブルーライン「センター南駅」または「仲町台駅」よりタクシーで約5分（「新横浜元石川線沿い、大塚交差点近くのMINI都筑ショールームまで」とお伝えください）。'
  },
  {
    slug: 'rolls-royce-motor-cars-yokohama',
    sales_subtitle: 'ロールス・ロイス・モーター・カーズ横浜',
    sales_fax: '045-680-4501',
    service_subtitle: null,
    service_fax: null,
    access_taxi: 'JR・私鉄各線「横浜駅」東口タクシー乗り場より約5分、またはみなとみらい線「みなとみらい駅」より約3分（「みなとみらい4丁目、横浜アイマークプレイスのロールス・ロイスまで」とお伝えください）。'
  },
  {
    slug: 'nicole-competizione-showroom',
    sales_subtitle: 'Nicole Competizione ショールーム',
    sales_fax: '045-680-4466',
    service_subtitle: null,
    service_fax: null,
    access_taxi: 'JR・私鉄各線「横浜駅」東口タクシー乗り場より約5分、またはみなとみらい線「みなとみらい駅」より約3分（「みなとみらい4丁目、アイマークプレイスのフェラーリショールームまで」とお伝えください）。'
  },
  {
    slug: 'nicole-setagaya',
    sales_subtitle: 'ニコル世田谷ショールーム',
    sales_fax: '03-5758-2525',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '東急田園都市線「用賀駅」または東急大井町線「等々力駅」よりタクシーで約5分（「環状8号線沿い、等々力不動前交差点近くのアルピナショールームまで」とお伝えください）。'
  },
  {
    slug: 'nicole-aoyama',
    sales_subtitle: 'ニコル青山ショールーム',
    sales_fax: '03-3478-1343',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '東京メトロ「赤坂見附駅」または「青山一丁目駅」よりタクシーで約3分（「青山通り沿い、草月会館・カナダ大使館並びのアルピナショールームまで」とお伝えください）。'
  },
  {
    slug: 'bps-kohoku',
    sales_subtitle: null,
    sales_fax: null,
    used_subtitle: 'BMW Premium Selection 横浜港北',
    used_fax: '045-472-2602',
    service_subtitle: null,
    service_fax: null,
    access_taxi: 'JR・横浜市営地下鉄「新横浜駅」北口タクシー乗り場より約8分（「新横浜元石川線沿い、川向町のBMW認定中古車センターまで」とお伝えください）。'
  },
  {
    slug: 'nicole-bmw-service-centre',
    sales_subtitle: null,
    sales_fax: null,
    used_subtitle: null,
    used_fax: null,
    service_subtitle: 'Nicole BMW Service Centre',
    service_fax: '045-948-2501',
    access_taxi: '横浜市営地下鉄グリーンライン「都筑ふれあいの丘駅」またはブルーライン「センター南駅」よりタクシーで約5分（「葛が谷のNicole BMWサービスセンターまで」とお伝えください）。'
  },
  {
    slug: 'mini-next-kohoku',
    sales_subtitle: null,
    sales_fax: null,
    used_subtitle: 'MINI NEXT 横浜港北',
    used_fax: '045-590-5031',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '横浜市営地下鉄「センター南駅」または「仲町台駅」よりタクシーで約5分（「MINI都筑併設のMINI NEXT認定中古車コーナーまで」とお伝えください）。'
  },
  {
    slug: 'nicole-competizione-pre-owned',
    sales_subtitle: null,
    sales_fax: null,
    used_subtitle: 'Nicole Competizione プレオウンド ショールーム',
    used_fax: '045-577-3818',
    service_subtitle: null,
    service_fax: null,
    access_taxi: '横浜市営地下鉄「新羽駅」またはJR「新横浜駅」よりタクシーで約10分（「川向町のNicole Competizione認定中古車ショールームまで」とお伝えください）。'
  },
  {
    slug: 'nicole-competizione-service-centre',
    sales_subtitle: null,
    sales_fax: null,
    used_subtitle: null,
    used_fax: null,
    service_subtitle: 'Nicole Competizione サービスセンター',
    service_fax: '045-577-3825',
    access_taxi: '横浜市営地下鉄「新羽駅」またはJR「新横浜駅」よりタクシーで約10分（「川向町のフェラーリサービスセンターまで」とお伝えください）。'
  }
];

const stmt = db.prepare(`
  UPDATE ec_locations 
  SET 
    sales_subtitle = COALESCE(?, sales_subtitle),
    sales_fax = COALESCE(?, sales_fax),
    used_subtitle = COALESCE(?, used_subtitle),
    used_fax = COALESCE(?, used_fax),
    service_subtitle = COALESCE(?, service_subtitle),
    service_fax = COALESCE(?, service_fax),
    access_taxi = COALESCE(?, access_taxi)
  WHERE slug = ?
`);

for (const u of updates) {
  stmt.run(
    u.sales_subtitle ?? null,
    u.sales_fax ?? null,
    u.used_subtitle ?? null,
    u.used_fax ?? null,
    u.service_subtitle ?? null,
    u.service_fax ?? null,
    u.access_taxi ?? null,
    u.slug
  );
}

console.log('Successfully updated all locations in DB.');
