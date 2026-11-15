import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SLUG = 'bmw-mini-rolls-royce-ferrari-resale-guide';

// 変換対象ブロック定義
function convertBlocks(blocks) {
  return blocks.map(block => {
    if (block._type !== 'htmlBlock') {
      return block;
    }

    if (block._key === 'diagram-3') {
      return {
        _type: 'editorial-tools:column_cards',
        _key: 'diagram-3',
        columns: '3',
        card_style: 'step',
        items: [
          {
            image: '/uploads/resale-guide/exchange.svg',
            title: '下取り',
            text: '【愛車 → 購入する販売店 → 次の車の代金へ】\n乗り換えをまとめたい方に。納車日と引渡日も一緒に調整できます。'
          },
          {
            image: '/uploads/resale-guide/wallet.svg',
            title: '買取',
            text: '【愛車 → 買取店 → 代金を受け取る】\n売却・入金の予定を立てたい方に。支払期限を契約で確認しましょう。'
          },
          {
            image: '/uploads/resale-guide/store.svg',
            title: '委託販売',
            text: '【販売店に依頼 → 買い手が決まる → 成約後に精算】\n時間に余裕がある方に。諸費用を引いた手取り額で比較します。'
          }
        ]
      };
    }

    if (block._key === 'diagram-6') {
      return {
        _type: 'editorial-tools:table',
        _key: 'diagram-6',
        title: '委託販売の手取り受取額 計算例',
        raw_csv: '項目\t金額\t備考\n成約価格\t880万円\t買い手への販売成立価格\n手数料・諸費用\t-55万円\t手数料44万円＋諸費用11万円（税込仮定）\n残債精算前の受取額\t825万円\t差額として手元に残る金額（目安）',
        caption: '※計算方法を示す架空例です。手数料44万円＋諸費用11万円を税込で仮定。当社の料金・査定額・実績ではありません。'
      };
    }

    if (block._key === 'diagram-12') {
      return {
        _type: 'editorial-tools:column_cards',
        _key: 'diagram-12',
        columns: '2',
        card_style: 'box',
        items: [
          {
            image: '/uploads/resale-guide/calendar.svg',
            title: '車検・保証の前',
            text: '更新費用をかける前に査定。費用と、乗り続ける価値を比較します。'
          },
          {
            image: '/uploads/resale-guide/car.svg',
            title: '次の車の納車前',
            text: '引渡日と納車日を調整。遅延時の再査定や移動費も確認。'
          },
          {
            image: '/uploads/resale-guide/clock.svg',
            title: '乗る機会が減ったとき',
            text: '駐車場・保険・整備費を整理。待つ間の負担も判断材料に。'
          },
          {
            image: '/uploads/resale-guide/store.svg',
            title: '委託販売は早めに',
            text: '売却期限から逆算。売れない場合の切替時期も決めておきます。'
          }
        ]
      };
    }

    if (block._key === 'diagram-15') {
      return {
        _type: 'image',
        _key: 'diagram-15',
        src: '/uploads/resale-guide/appraisal-preparation.png',
        alt: '車のキー、書類ケース、ペンを並べた査定準備のイメージ',
        caption: '査定前の準備を表現したAI生成イメージ',
        alignment: 'center'
      };
    }

    if (block._key === 'diagram-16') {
      return {
        _type: 'editorial-tools:column_cards',
        _key: 'diagram-16',
        columns: '2',
        card_style: 'box',
        items: [
          {
            image: '/uploads/resale-guide/folder.svg',
            title: '資料をそろえる',
            text: '整備記録・保証書・装備の明細。愛車の履歴が伝わる資料を準備。'
          },
          {
            image: '/uploads/resale-guide/key.svg',
            title: 'キーと付属品を確認',
            text: 'スペアキー・取扱説明書・純正部品。残っているものをまとめます。'
          },
          {
            image: '/uploads/resale-guide/car.svg',
            title: '状態を正確に伝える',
            text: '修復歴・不具合・改造箇所を共有。高額な補修は査定後に検討。'
          },
          {
            image: '/uploads/resale-guide/calendar.svg',
            title: '引渡条件をそろえる',
            text: '希望時期・走行距離・見積もり期限をそろえて比較します。'
          }
        ]
      };
    }

    return block;
  });
}

// 対象DBファイルリスト
const dbFiles = [];
if (fs.existsSync('seed/backup.sqlite')) {
  dbFiles.push('seed/backup.sqlite');
}

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  for (const f of files) {
    if (f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak')) {
      dbFiles.push(path.join(d1Dir, f));
    }
  }
}

console.log('Target database files:', dbFiles);

for (const dbPath of dbFiles) {
  console.log(`\nProcessing ${dbPath}...`);
  
  // 1. ec_magazine からレコード取得
  const rowQuery = `SELECT id, content, live_revision_id FROM ec_magazine WHERE slug = '${SLUG}';`;
  let result;
  try {
    result = execSync(`sqlite3 "${dbPath}" "${rowQuery}"`, { maxBuffer: 10 * 1024 * 1024 }).toString().trim();
  } catch (err) {
    console.error(`Failed to query ${dbPath}:`, err.message);
    continue;
  }

  if (!result) {
    console.log(`No entry found for slug ${SLUG} in ${dbPath}`);
    continue;
  }

  const [id, rawContent, liveRevisionId] = result.split('|');
  const originalBlocks = JSON.parse(rawContent);
  const updatedBlocks = convertBlocks(originalBlocks);
  const updatedJsonStr = JSON.stringify(updatedBlocks);

  // 一時ファイルにJSONを書き出してsqlite3で安全にUPDATE
  const tempJsonPath = `/tmp/converted_content_${Date.now()}.json`;
  fs.writeFileSync(tempJsonPath, updatedJsonStr, 'utf8');

  // UPDATE ec_magazine
  const updateCmd = `sqlite3 "${dbPath}" "UPDATE ec_magazine SET content = CAST(readfile('${tempJsonPath}') AS TEXT) WHERE id = '${id}';"`;
  execSync(updateCmd);
  console.log(`Updated ec_magazine for entry ${id} in ${dbPath}`);

  // UPDATE revisions if liveRevisionId exists
  if (liveRevisionId) {
    try {
      const revRaw = execSync(`sqlite3 "${dbPath}" "SELECT data FROM revisions WHERE id = '${liveRevisionId}';"`, { maxBuffer: 10 * 1024 * 1024 }).toString().trim();
      if (revRaw) {
        const revData = JSON.parse(revRaw);
        revData.content = updatedBlocks;
        const tempRevJsonPath = `/tmp/converted_rev_${Date.now()}.json`;
        fs.writeFileSync(tempRevJsonPath, JSON.stringify(revData), 'utf8');
        execSync(`sqlite3 "${dbPath}" "UPDATE revisions SET data = CAST(readfile('${tempRevJsonPath}') AS TEXT) WHERE id = '${liveRevisionId}';"`);
        fs.unlinkSync(tempRevJsonPath);
        console.log(`Updated revisions for ${liveRevisionId} in ${dbPath}`);
      }
    } catch (err) {
      console.warn(`Warning updating revisions in ${dbPath}:`, err.message);
    }
  }

  fs.unlinkSync(tempJsonPath);
}

console.log('\nMigration completed successfully!');
