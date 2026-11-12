import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
const dbPath = path.join(d1Dir, dbFile);
const db = new DatabaseSync(dbPath);

console.log('Connecting to D1 DB:', dbPath);

// HTML Table definitions
const TABLE_BMW_7_SERIES = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 720px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">車種</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">タイプ</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ボディサイズ</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">パワートレイン／出力</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">特徴／航続距離</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">i7 60 xDrive<br><span style="font-size: 0.8125rem; font-weight: normal; color: var(--color-text-secondary, #666);">(Excellence / M Sport)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap;">完全電動<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(BEV)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長 5,395 mm<br>全幅 1,950 mm<br>全高 1,555 mm<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(WB 3,215 mm)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap;">デュアルモーター<br>544hp (745Nm)</td>
        <td style="padding: 14px 16px;">WLTP航続距離 最大726km<br>250kW急速充電対応<br>Excellence / M Sport設定</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">i7 M70 xDrive</td>
        <td style="padding: 14px 16px; white-space: nowrap;">完全電動<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(BEV / M)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長 5,395 mm<br>全幅 1,950 mm<br>全高 1,555 mm<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(WB 3,215 mm)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap;">デュアルモーター<br>680hp (1,015Nm)</td>
        <td style="padding: 14px 16px;">0-100km/h 3.8秒<br>M専用チューニング<br>WLTP航続距離 約685km</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">740 Excellence</td>
        <td style="padding: 14px 16px; white-space: nowrap;">ガソリン<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(ICE / MHV)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長 5,395 mm<br>全幅 1,950 mm<br>全高 1,550 mm<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(WB 3,215 mm)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap;">3.0L 直6ターボ<br>48V / 381hp</td>
        <td style="padding: 14px 16px;">BMW伝統のシルキーシックス<br>洗練されたラグジュアリー<br>エレガント仕様</td>
      </tr>
      <tr style="background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">740 M Sport</td>
        <td style="padding: 14px 16px; white-space: nowrap;">ガソリン<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(ICE / MHV)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長 5,395 mm<br>全幅 1,950 mm<br>全高 1,550 mm<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(WB 3,215 mm)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap;">3.0L 直6ターボ<br>48V / 381hp</td>
        <td style="padding: 14px 16px;">シルキーシックスの快音<br>専用Mエアロ・サスペンション<br>スポーティ仕様</td>
      </tr>
    </tbody>
  </table>
</div>
<p style="font-size: 0.8125rem; color: var(--color-text-secondary, #666); margin: -16px 0 24px 0;">※数値は欧州仕様車を参考としています。</p>`;

const TABLE_BMW_ORIGINAL = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 680px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">モデル名</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ボディタイプ</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">サイズ（全長×全幅×全高）</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">税込車両価格</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">従来モデルとの差額</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW 120 original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">ハッチバック<br><span style="font-size: 0.8125rem; color: var(--color-text-secondary, #666);">(Cセグメント)</span></td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,370 mm<br>全幅：1,800 mm<br>全高：1,465 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">4,800,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">120（5,000,000円）より 20万円安<br>M Sport（5,210,000円）より <strong style="color: var(--color-brand, #d11a2a);">41万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW 220i アクティブツアラー original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">ファミリー向けMPV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,385 mm<br>全幅：1,825 mm<br>全高：1,580 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">4,980,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">Exclusive（5,430,000円）より 45万円安<br>M Sport（5,430,000円）より <strong style="color: var(--color-brand, #d11a2a);">45万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW 220 グラン クーペ original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">4ドアクーペ</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,550 mm<br>全幅：1,800 mm<br>全高：1,450 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">4,980,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">M Sport（5,360,000円）より <strong style="color: var(--color-brand, #d11a2a);">38万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW X1 sDrive20i original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">コンパクトSUV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,500 mm<br>全幅：1,835 mm<br>全高：1,645 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">5,250,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">M Sport（5,670,000円）より <strong style="color: var(--color-brand, #d11a2a);">42万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW X2 sDrive20i original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">クーペスタイルSUV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,555 mm<br>全幅：1,835 mm<br>全高：1,590 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">5,500,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">M Sport（5,920,000円）より <strong style="color: var(--color-brand, #d11a2a);">42万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW X3 20 original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">プレミアムSAV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,755 mm<br>全幅：1,920 mm<br>全高：1,660 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">7,670,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">X3 20 xDrive xLine（8,180,000円）より <strong style="color: var(--color-brand, #d11a2a);">51万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW X3 20d original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">プレミアムSAV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,755 mm<br>全幅：1,920 mm<br>全高：1,660 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">7,870,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">M Sport（8,870,000円）より <strong style="color: var(--color-brand, #d11a2a);">100万円安</strong></td>
      </tr>
      <tr style="background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW X5 xDrive40d M Sport original</td>
        <td style="padding: 14px 16px; white-space: nowrap;">ラグジュアリーSAV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,935 mm<br>全幅：2,005 mm<br>全高：1,770 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">12,980,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">Final Edition（13,980,000円）より <strong style="color: var(--color-brand, #d11a2a);">100万円安</strong></td>
      </tr>
    </tbody>
  </table>
</div>
<p style="font-size: 0.8125rem; color: var(--color-text-secondary, #666); margin: -16px 0 24px 0;">※従来モデルとの差額については、オプション等を含めない記事投稿時点の標準価格（メーカー希望小売価格）より算出しています。詳細はショールームにてご相談承っています。</p>`;

const TABLE_MINI_SELECT = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 680px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">モデル名</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ボディタイプ</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">サイズ（全長×全幅×全高）</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">税込車両価格</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">従来モデルとの差額</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI COOPER C SELECT（3-DOOR）</td>
        <td style="padding: 14px 16px; white-space: nowrap;">3ドアハッチバック</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：3,875 mm<br>全幅：1,745 mm<br>全高：1,455 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">3,650,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">MINI COOPER C（4,020,000円）より <strong style="color: var(--color-brand, #d11a2a);">37万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI COOPER 5-DOOR C SELECT</td>
        <td style="padding: 14px 16px; white-space: nowrap;">5ドアハッチバック</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,035 mm<br>全幅：1,745 mm<br>全高：1,470 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">3,770,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">MINI COOPER 5-DOOR C（4,140,000円）より <strong style="color: var(--color-brand, #d11a2a);">37万円安</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI COUNTRYMAN C SELECT</td>
        <td style="padding: 14px 16px; white-space: nowrap;">FF駆動SUV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,445 mm<br>全幅：1,845 mm<br>全高：1,660 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">4,800,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">MINI COUNTRYMAN C（5,180,000円）より <strong style="color: var(--color-brand, #d11a2a);">38万円安</strong></td>
      </tr>
      <tr style="background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI COUNTRYMAN S ALL4 SELECT</td>
        <td style="padding: 14px 16px; white-space: nowrap;">4輪駆動SUV</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">全長：4,445 mm<br>全幅：1,845 mm<br>全高：1,660 mm</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums;">5,530,000円</td>
        <td style="padding: 14px 16px; font-size: 0.875rem;">MINI COUNTRYMAN S ALL4（5,920,000円）より <strong style="color: var(--color-brand, #d11a2a);">39万円安</strong></td>
      </tr>
    </tbody>
  </table>
</div>
<p style="font-size: 0.8125rem; color: var(--color-text-secondary, #666); margin: -16px 0 24px 0;">※従来モデルとの差額については、オプション等を含めない記事投稿時点の標準価格（メーカー希望小売価格）より算出しています。詳細はショールームにてご相談承っています。</p>`;

const TABLE_USED_COMPARISON = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">比較項目</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">メーカー認定中古車</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">一般中古車</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">納車前点検</td>
        <td style="padding: 14px 16px;"><strong style="color: var(--color-brand, #d11a2a);">メーカー所定基準（最大202項目等）</strong></td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">販売店による（規定なし）</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">保証</td>
        <td style="padding: 14px 16px;"><strong style="color: var(--color-brand, #d11a2a);">ブランド専用保証あり（最長4年・走行無制限等）</strong></td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">店舗・車両による（現状渡しも有）</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">整備</td>
        <td style="padding: 14px 16px;">正規ネットワーク基準・専任マイスター</td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">販売店による</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">純正部品</td>
        <td style="padding: 14px 16px;">メーカー純正部品を100%使用</td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">店舗による（社外品・中古部品の場合あり）</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ロードサービス</td>
        <td style="padding: 14px 16px;">24時間365日エマージェンシーサービス付帯</td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">店舗・任意保険による</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">延長保証</td>
        <td style="padding: 14px 16px;">ブランド所定の延長保証プログラム設定あり</td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">店舗による</td>
      </tr>
      <tr style="background: var(--color-surface, #ffffff);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">購入価格</td>
        <td style="padding: 14px 16px;">安心と保証の分、高くなる場合がある</td>
        <td style="padding: 14px 16px; color: var(--color-text-secondary, #666);">幅広い（安価な車両も存在）</td>
      </tr>
    </tbody>
  </table>
</div>`;

const TABLE_USED_4BRANDS = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 720px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ブランド</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">プログラム名</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">保証内容</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">点検／検査</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">サポート／付帯</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW Premium Selection</td>
        <td style="padding: 14px 16px;">車齢7年目まで最長4年／走行距離無制限（車両により期間差）</td>
        <td style="padding: 14px 16px;">360°チェック／100項目以上の所定点検・純正部品で整備</td>
        <td style="padding: 14px 16px;">24h / 365日 エマージェンシー＋メインテナンス・フリー（6か月/7,500km）</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI NEXT</td>
        <td style="padding: 14px 16px;">車齢7年目まで：2年走行距離無制限／延長で最長4年</td>
        <td style="padding: 14px 16px;">360°チェック（電気系統/コンピュータ含む）</td>
        <td style="padding: 14px 16px;">24h / 365日 エマージェンシー＋メインテナンス・フリー（6か月/7,500km）</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Rolls-Royce</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Rolls-Royce Provenance</td>
        <td style="padding: 14px 16px;">2年間の追加保証</td>
        <td style="padding: 14px 16px;">360°の徹底検査（基準合格）</td>
        <td style="padding: 14px 16px;">2年間のサービス＋ロードサイド＋Whispers利用権</td>
      </tr>
      <tr style="background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Ferrari</td>
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Ferrari Approved</td>
        <td style="padding: 14px 16px;">日本国内：24か月以上／距離無制限の保証</td>
        <td style="padding: 14px 16px;">最大202項目の技術点検・実走テスト</td>
        <td style="padding: 14px 16px;">日本国内：24か月以上／距離無制限のロードサイド</td>
      </tr>
    </tbody>
  </table>
</div>`;

const TABLE_PPF = `<div class="nicole-table-container" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 28px 0; border: 1px solid var(--color-border, #e5e5e7); border-radius: 8px; background: var(--color-surface, #ffffff);">
  <table class="nicole-spec-table" style="width: 100%; min-width: 680px; border-collapse: collapse; text-align: left; font-size: 0.9375rem; line-height: 1.6;">
    <thead>
      <tr style="background: var(--color-fill, #f5f5f7); border-bottom: 2px solid var(--color-border, #e5e5e7);">
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">ブランド / モデル</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">フロントフル (ULTIMATE PLUS)</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">フルボディ (ULTIMATE PLUS)</th>
        <th style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">生活傷保護セット</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW 3 Series (Sedan)</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥458,700</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥1,479,500</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">¥63,800</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">MINI 3 DOOR</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥288,200</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥1,210,000</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">¥50,600</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">BMW ALPINA B3 GT</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥489,500</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥1,584,000</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">¥77,000</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--color-border, #e5e5e7); background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Rolls-Royce Ghost</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥624,800</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥2,274,800</td>
        <td style="padding: 14px 16px; white-space: nowrap; font-variant-numeric: tabular-nums;">¥77,000</td>
      </tr>
      <tr style="background: var(--color-bg, #fafafa);">
        <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">Ferrari（296 GTBなど）</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥450,000〜¥750,000</td>
        <td style="padding: 14px 16px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums;">¥1,500,000〜¥2,200,000</td>
        <td style="padding: 14px 16px; white-space: nowrap; color: var(--color-text-secondary, #999);">─</td>
      </tr>
    </tbody>
  </table>
</div>`;

function makeHtmlBlock(key, html) {
  return {
    _type: 'custom_html',
    _key: key,
    html: html.trim()
  };
}

function makeFaqBlock(key, items) {
  return {
    _type: 'faq',
    _key: key,
    style: 'qa',
    items: items.map(it => ({
      question: it.question.trim(),
      answer: it.answer.trim()
    }))
  };
}

// Universal FAQ parser for an article's blocks
function convertFaqsInBlocks(blocks, slug) {
  let faqHeadingIdx = -1;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const text = b.children?.map(c => c.text || '').join('').trim() || '';
    if ((b.style === 'h2' || b.style === 'h3') && /^(?:FAQ|よくある質問|Q&A|Ｑ＆Ａ|後悔回避FAQ|決断用FAQ)/i.test(text)) {
      faqHeadingIdx = i;
      break;
    }
  }

  if (faqHeadingIdx === -1) {
    return blocks;
  }

  // Find end of FAQ section (next H2 or end of blocks, or recommendation section)
  let endIdx = blocks.length;
  for (let i = faqHeadingIdx + 1; i < blocks.length; i++) {
    const b = blocks[i];
    const text = b.children?.map(c => c.text || '').join('').trim() || '';
    if (b.style === 'h2' && !/FAQ|よくある質問/i.test(text)) {
      endIdx = i;
      break;
    }
  }

  const faqCandidateBlocks = blocks.slice(faqHeadingIdx + 1, endIdx);
  const items = [];
  let currentQ = '';
  let currentA = '';

  for (const block of faqCandidateBlocks) {
    const text = block.children?.map(c => c.text || '').join('').trim() || '';
    if (!text) continue;
    if (text === '試乗・相談予約はこちら' || text === '試乗・相談予約をする') continue;

    // Pattern A: Multi Qs merged in one block (e.g. Q1. ... A. ... Q2. ... A. ...)
    const qMatches = [...text.matchAll(/(?:^|\n|\s|。)([QＱ][0-9０-９.．:：\s][^\n]*|\bQ\d+[:.][^\n]*)/gi)];
    if (qMatches.length > 1) {
      const parts = text.split(/(?=(?:^|\n|\s|。)[QＱ][0-9０-９.．:：\s]|(?:^|\n|\s|。)Q\d+[:.])/);
      for (const p of parts) {
        let trimmed = p.trim().replace(/^。/, '').trim();
        if (!trimmed) continue;
        const aIndex = trimmed.search(/\n[\s\n]*[AＡ][:：.\s]|[?？\s][AＡ][:：.]/);
        if (aIndex !== -1) {
          const q = trimmed.slice(0, aIndex + (trimmed[aIndex] === '?' || trimmed[aIndex] === '？' ? 1 : 0))
            .replace(/^[QＱ][0-9０-９.．:：\s]*|\bQ\d+[:.]\s*/, '')
            .replace(/\+$/, '')
            .trim();
          const a = trimmed.slice(aIndex + (trimmed[aIndex] === '?' || trimmed[aIndex] === '？' ? 1 : 0))
            .replace(/^[\s\n]*[AＡ][:：.\s]*/, '')
            .trim();
          if (q && a) items.push({ question: q, answer: a });
        }
      }
      continue;
    }

    // Pattern B: Single Q & A in one block
    const singleAIndex = text.search(/\n[\s\n]*[AＡ][:：.\s]|[?？\s][AＡ][:：.]/);
    if (/^[QＱ][0-9０-９.．:：\s]|\bQ\d+[:.]/i.test(text) && singleAIndex !== -1) {
      if (currentQ) {
        items.push({ question: currentQ, answer: currentA });
        currentQ = '';
        currentA = '';
      }
      const q = text.slice(0, singleAIndex + (text[singleAIndex] === '?' || text[singleAIndex] === '？' ? 1 : 0))
        .replace(/^[QＱ][0-9０-９.．:：\s]*|\bQ\d+[:.]\s*/, '')
        .replace(/\+$/, '')
        .trim();
      const a = text.slice(singleAIndex + (text[singleAIndex] === '?' || text[singleAIndex] === '？' ? 1 : 0))
        .replace(/^[\s\n]*[AＡ][:：.\s]*/, '')
        .trim();
      if (q && a) items.push({ question: q, answer: a });
      continue;
    }

    // Pattern C: Q block followed by A block
    if (/^[QＱ][0-9０-９.．:：\s]|\bQ\d+[:.]/i.test(text)) {
      if (currentQ) {
        items.push({ question: currentQ, answer: currentA });
        currentA = '';
      }
      currentQ = text.replace(/^[QＱ][0-9０-９.．:：\s]*|\bQ\d+[:.]\s*/, '').replace(/\+$/, '').trim();
    } else if (/^[AＡ][0-9０-９.．:：\s]|\bA\d+[:.]/i.test(text)) {
      const aText = text.replace(/^[AＡ][0-9０-９.．:：\s]*|\bA\d+[:.]\s*/, '').trim();
      currentA = currentA ? currentA + '\n' + aText : aText;
    } else {
      if (currentQ && !currentA) {
        currentA = text;
      } else if (currentQ && currentA) {
        currentA += '\n' + text;
      }
    }
  }

  if (currentQ && currentA) {
    items.push({ question: currentQ, answer: currentA });
  }

  if (items.length === 0) {
    return blocks;
  }

  console.log(`  -> Converted ${items.length} FAQ items for [${slug}]`);
  const faqBlock = makeFaqBlock(`faq_${slug}_${Date.now()}`, items);

  return [
    ...blocks.slice(0, faqHeadingIdx + 1),
    faqBlock,
    ...blocks.slice(endIdx)
  ];
}

// Clean JSON-LD and raw CSS from blocks
function cleanRawArtifacts(blocks) {
  return blocks.filter(b => {
    const text = b.children?.map(c => c.text || '').join('').trim() || '';
    // Strip raw JSON-LD in paragraph
    if (text.includes('"@context"') && text.includes('schema.org')) {
      return false;
    }
    // Strip raw CSS in paragraph
    if (text.includes('{') && text.includes('}') && (text.includes('overflow-x') || text.includes('-table-wrap') || text.includes('.nc-'))) {
      return false;
    }
    // Strip orphaned scroll guide paragraph if table is converted
    if (text === '← 横にスクロールしてご覧いただけます →') {
      return false;
    }
    return true;
  });
}

const rows = db.prepare("SELECT id, slug, title, content FROM ec_magazine").all();
console.log(`Processing ${rows.length} articles...`);

let updatedCount = 0;
const updatedArticles = {};

for (const row of rows) {
  let content = [];
  try {
    content = JSON.parse(row.content || '[]');
  } catch (e) {
    continue;
  }

  let modified = false;
  let newContent = [...content];

  // Robust check using joined full text of block
  const getFullText = b => b?.children?.map(c => c.text || '').join('') || '';

  if (row.slug === '2026最新新型bmw-7シリーズ徹底解説比較と失敗しない選び方') {
    const startIdx = newContent.findIndex(b => {
      const t = getFullText(b).trim();
      return t === '← 横にスクロールしてご覧いただけます →' || t === '車種';
    });
    const endIdx = newContent.findIndex((b, idx) => idx > startIdx && b.style === 'h2' && getFullText(b).includes('先進のインテリア'));
    if (startIdx !== -1 && endIdx !== -1) {
      console.log(`  [${row.slug}] Replacing broken 7-series table from #${startIdx} to #${endIdx}`);
      const tableBlock = makeHtmlBlock('tbl_7series_spec', TABLE_BMW_7_SERIES);
      newContent.splice(startIdx, endIdx - startIdx, tableBlock);
      modified = true;
    }
  } else if (row.slug === 'i7740徹底比較新型7シリーズ後悔しない選び方') {
    const startIdx = newContent.findIndex(b => {
      const t = getFullText(b).trim();
      return t === '← 横にスクロールしてご覧いただけます →' || t === '車種';
    });
    const endIdx = newContent.findIndex((b, idx) => idx > startIdx && b.style === 'h2' && getFullText(b).includes('後悔しない！あなたに最適な7シリーズ診断チャート'));
    if (startIdx !== -1 && endIdx !== -1) {
      console.log(`  [${row.slug}] Replacing broken 7-series table from #${startIdx} to #${endIdx}`);
      const tableBlock = makeHtmlBlock('tbl_i7_spec', TABLE_BMW_7_SERIES);
      newContent.splice(startIdx, endIdx - startIdx, tableBlock);
      modified = true;
    }
  } else if (row.slug === '202609_bmw_original-entry-guide') {
    const tableIdx = newContent.findIndex(b => getFullText(b).includes('BMW 120 original') && getFullText(b).includes('全長：4,370'));
    if (tableIdx !== -1) {
      console.log(`  [${row.slug}] Replacing collapsed BMW original table at #${tableIdx}`);
      newContent[tableIdx] = makeHtmlBlock('tbl_bmw_original', TABLE_BMW_ORIGINAL);
      modified = true;
    }
  } else if (row.slug === '202609_mini_select-entry-guide') {
    const tableIdx = newContent.findIndex(b => getFullText(b).includes('MINI COOPER C SELECT') && getFullText(b).includes('全長：3,875'));
    if (tableIdx !== -1) {
      console.log(`  [${row.slug}] Replacing collapsed MINI SELECT table at #${tableIdx}`);
      newContent[tableIdx] = makeHtmlBlock('tbl_mini_select', TABLE_MINI_SELECT);
      modified = true;
    }
  } else if (row.slug === '202609_bmw_mini_original-select-guide') {
    const bmwTblIdx = newContent.findIndex(b => getFullText(b).includes('BMW 120 original') && getFullText(b).includes('全長：4,370'));
    if (bmwTblIdx !== -1) {
      console.log(`  [${row.slug}] Replacing collapsed BMW original table at #${bmwTblIdx}`);
      newContent[bmwTblIdx] = makeHtmlBlock('tbl_bmw_original_guide', TABLE_BMW_ORIGINAL);
      modified = true;
    }
    const miniTblIdx = newContent.findIndex(b => getFullText(b).includes('MINI COOPER C SELECT') && getFullText(b).includes('全長：3,875'));
    if (miniTblIdx !== -1) {
      console.log(`  [${row.slug}] Replacing collapsed MINI SELECT table at #${miniTblIdx}`);
      newContent[miniTblIdx] = makeHtmlBlock('tbl_mini_select_guide', TABLE_MINI_SELECT);
      modified = true;
    }
  } else if (row.slug === '202607_nicole_certified-used-cars-guide') {
    const compIdx = newContent.findIndex(b => getFullText(b).includes('比較項目') && getFullText(b).includes('メーカー認定中古車'));
    if (compIdx !== -1) {
      console.log(`  [${row.slug}] Replacing comparison table at #${compIdx}`);
      newContent[compIdx] = makeHtmlBlock('tbl_used_comp', TABLE_USED_COMPARISON);
      modified = true;
    }
    const brandsIdx = newContent.findIndex(b => getFullText(b).includes('BMW Premium Selection') && getFullText(b).includes('Rolls-Royce Provenance'));
    if (brandsIdx !== -1) {
      console.log(`  [${row.slug}] Replacing 4-brands table at #${brandsIdx}`);
      newContent[brandsIdx] = makeHtmlBlock('tbl_used_4brands', TABLE_USED_4BRANDS);
      modified = true;
    }
  } else if (row.slug === '202606_nicole_protection-film') {
    const ppfIdx = newContent.findIndex(b => getFullText(b).includes('BMW 3 Series') && getFullText(b).includes('¥458,700'));
    if (ppfIdx !== -1) {
      console.log(`  [${row.slug}] Replacing PPF table at #${ppfIdx}`);
      newContent[ppfIdx] = makeHtmlBlock('tbl_ppf_price', TABLE_PPF);
      modified = true;
    }
  }

  // Next, convert FAQs
  const beforeFaqLen = newContent.length;
  newContent = convertFaqsInBlocks(newContent, row.slug);
  if (newContent.length !== beforeFaqLen || newContent.some(b => b._type === 'faq' && !content.some(cb => cb._type === 'faq'))) {
    modified = true;
  }

  // Next, clean raw JSON-LD and raw CSS
  const beforeCleanLen = newContent.length;
  newContent = cleanRawArtifacts(newContent);
  if (newContent.length !== beforeCleanLen) {
    modified = true;
  }

  if (modified) {
    updatedCount++;
    const jsonStr = JSON.stringify(newContent);
    db.prepare("UPDATE ec_magazine SET content = ? WHERE id = ?").run(jsonStr, row.id);
    updatedArticles[row.slug] = newContent;
  }
}

console.log(`\nSuccessfully updated ${updatedCount} articles in D1 SQLite database!`);

// Also update seed/seed.json if exists
const seedFile = 'seed/seed.json';
if (fs.existsSync(seedFile)) {
  console.log(`Syncing changes to ${seedFile}...`);
  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  if (seed.content?.magazine && Array.isArray(seed.content.magazine)) {
    let seedUpdated = 0;
    seed.content.magazine.forEach(entry => {
      if (updatedArticles[entry.slug]) {
        entry.content = updatedArticles[entry.slug];
        seedUpdated++;
      }
    });
    fs.writeFileSync(seedFile, JSON.stringify(seed, null, 2), 'utf8');
    console.log(`Synced ${seedUpdated} magazine entries to ${seedFile}.`);
  }
}
