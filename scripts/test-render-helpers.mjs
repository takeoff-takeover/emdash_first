import fs from 'fs';

// Helper to sanitize slug
function toSlug(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
}

// Generate Model Loop Item
export function renderModelLoopItem(model) {
  const brandSlug = toSlug(model.brand);
  const seriesSlug = toSlug(model.series || '');
  const bodySlug = toSlug(model.bodyType || '');
  
  const powertrainClasses = (model.powertrains || [])
    .map(p => {
      if (p.includes('ガソリン')) return 'powertrain-gasoline';
      if (p.includes('ディーゼル')) return 'powertrain-diesel';
      if (p.includes('電気')) return 'powertrain-bev';
      if (p.includes('プラグイン') || p.includes('PHEV')) return 'powertrain-phev';
      return `powertrain-${toSlug(p)}`;
    })
    .join(' ');

  const badgesHtml = (model.powertrains || [])
    .map(p => {
      let badgeClass = 'ng-badge--gasoline';
      if (p.includes('ディーゼル')) badgeClass = 'ng-badge--diesel';
      else if (p.includes('電気')) badgeClass = 'ng-badge--bev';
      else if (p.includes('プラグイン') || p.includes('PHEV')) badgeClass = 'ng-badge--phev';
      return `<span class="ng-badge ${badgeClass}">${p}</span>`;
    })
    .join(' ');

  return `
				<div data-elementor-type="loop-item" data-elementor-id="143" class="elementor elementor-143 e-loop-item e-loop-item-${model.id} post-${model.id} vehicle type-vehicle status-publish hentry brand-${brandSlug} series-${seriesSlug} body_type-${bodySlug} ${powertrainClasses} nicole-brand-content nicole-brand-${brandSlug} nicole-brand-content-${brandSlug} ast-article-single" data-elementor-post-type="elementor_library" data-custom-edit-handle="1">
			<div class="elementor-element elementor-element-dbbb6e0 e-flex e-con-boxed e-con e-parent" data-id="dbbb6e0" data-element_type="container" data-e-type="container">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-ef5b364 elementor-widget elementor-widget-image" data-id="ef5b364" data-element_type="widget" data-e-type="widget" data-widget_type="image.default">
																<a href="${model.detailUrl}">
							<img decoding="async" width="1024" height="576" src="${model.image}" class="attachment-large size-large wp-image-${model.id}" alt="${model.name}" />								</a>
															</div>
				<div class="elementor-element elementor-element-1da3959 elementor-widget elementor-widget-heading" data-id="1da3959" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
					<h5 class="elementor-heading-title elementor-size-default"><a href="${model.detailUrl}">${model.catchphrase}</a></h5>				</div>
				<div class="elementor-element elementor-element-3bdf977 elementor-widget elementor-widget-heading" data-id="3bdf977" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
					<h3 class="elementor-heading-title elementor-size-default"><a href="${model.detailUrl}">${model.name}</a></h3>				</div>
				<div class="elementor-element elementor-element-87d8a36 elementor-widget elementor-widget-text-editor" data-id="87d8a36" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									<div class="ng-badges ng-badges-powertrain">${badgesHtml}</div>								</div>
					</div>
				</div>
				</div>`;
}

// Generate Location Loop Item
export function renderLocationLoopItem(loc) {
  const brandSlug = toSlug(loc.brand);
  const cleanTel = (loc.tel || '').replace(/[^0-9]/g, '');

  return `
				<div data-elementor-type="loop-item" data-elementor-id="7256" class="elementor elementor-7256 e-loop-item e-loop-item-${loc.id} post-${loc.id} location type-location status-publish hentry brand-${brandSlug} location_type-showroom nicole-brand-content nicole-brand-${brandSlug} nicole-brand-content-${brandSlug} ast-article-single" data-elementor-post-type="elementor_library" data-custom-edit-handle="1">
			<div class="elementor-element elementor-element-1e1c8d3 e-con-full e-flex e-con e-parent" data-id="1e1c8d3" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-49f08e32 e-con-full e-flex e-con e-child" data-id="49f08e32" data-element_type="container" data-e-type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
				<div class="elementor-element elementor-element-621f60ac elementor-arrows-position-inside elementor-widget elementor-widget-image-carousel" data-id="621f60ac" data-element_type="widget" data-e-type="widget" data-settings="{&quot;slides_to_show&quot;:&quot;1&quot;,&quot;navigation&quot;:&quot;arrows&quot;,&quot;autoplay&quot;:&quot;yes&quot;,&quot;pause_on_hover&quot;:&quot;yes&quot;,&quot;pause_on_interaction&quot;:&quot;yes&quot;,&quot;autoplay_speed&quot;:5000,&quot;infinite&quot;:&quot;yes&quot;,&quot;effect&quot;:&quot;slide&quot;,&quot;speed&quot;:500}" data-widget_type="image-carousel.default">
							<div class="elementor-image-carousel-wrapper swiper" role="region" aria-roledescription="carousel" aria-label="画像カルーセル" dir="ltr">
			<div class="elementor-image-carousel swiper-wrapper swiper-image-stretch" aria-live="off">
								<div class="swiper-slide" role="group" aria-roledescription="slide" aria-label="1 / 1"><a data-elementor-open-lightbox="yes" href="${loc.url || loc.detailUrl}"><figure class="swiper-slide-inner"><img decoding="async" class="swiper-slide-image" src="${loc.image}" alt="${loc.name}" /></figure></a></div>			</div>
					</div>
						</div>
				</div>
		<div class="elementor-element elementor-element-7a77ab10 e-con-full e-flex e-con e-child" data-id="7a77ab10" data-element_type="container" data-e-type="container">
				<div class="elementor-element elementor-element-19ed2ffc elementor-widget elementor-widget-heading" data-id="19ed2ffc" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
					<h2 class="elementor-heading-title elementor-size-default"><a href="${loc.url || loc.detailUrl}">${loc.name}</a></h2>				</div>
				<div class="elementor-element elementor-element-69d47ba9 elementor-widget elementor-widget-text-editor" data-id="69d47ba9" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									<span>${loc.facilityType}</span>								</div>
				<div class="elementor-element elementor-element-18aad1da elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="18aad1da" data-element_type="widget" data-e-type="widget" data-widget_type="divider.default">
							<div class="elementor-divider">
			<span class="elementor-divider-separator">
						</span>
		</div>
						</div>
		<div class="elementor-element elementor-element-55aee95 e-con-full e-flex e-con e-child" data-id="55aee95" data-element_type="container" data-e-type="container">
				<div class="elementor-element elementor-element-10966b26 elementor-widget elementor-widget-text-editor" data-id="10966b26" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									${loc.postal}								</div>
				<div class="elementor-element elementor-element-eb92c6e elementor-widget elementor-widget-heading" data-id="eb92c6e" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
					<h2 class="elementor-heading-title elementor-size-default"><a href="${loc.url || loc.detailUrl}">${loc.address}</a></h2>				</div>
				</div>
		<div class="elementor-element elementor-element-30d045fb e-con-full e-flex e-con e-child" data-id="30d045fb" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-d19b336 e-con-full e-flex e-con e-child" data-id="d19b336" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-dc50c38 e-con-full e-flex e-con e-child" data-id="dc50c38" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-6ddb5688 e-con-full e-flex e-con e-child" data-id="6ddb5688" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-6a0f5923 e-con-full e-flex e-con e-child" data-id="6a0f5923" data-element_type="container" data-e-type="container">
		<div class="elementor-element elementor-element-61b4499 e-con-full e-flex e-con e-child" data-id="61b4499" data-element_type="container" data-e-type="container">
				<div class="elementor-element elementor-element-4f82db6 elementor-widget elementor-widget-heading" data-id="4f82db6" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
					<div class="elementor-heading-title elementor-size-default"><a href="tel:${cleanTel}">TEL：${loc.tel}</a></div>				</div>
				${loc.fax ? `<div class="elementor-element elementor-element-f9d05eb elementor-widget elementor-widget-text-editor" data-id="f9d05eb" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									FAX：${loc.fax}								</div>` : ''}
				</div>
				${loc.hours ? `<div class="elementor-element elementor-element-5ee9b37 elementor-widget__width-inherit elementor-widget elementor-widget-text-editor" data-id="5ee9b37" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									営業時間：${loc.hours}								</div>` : ''}
				${loc.closed ? `<div class="elementor-element elementor-element-50358a51 elementor-widget__width-inherit elementor-widget elementor-widget-text-editor" data-id="50358a51" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
									定休日：${loc.closed}								</div>` : ''}
				</div>
				</div>
				</div>
				</div>
				</div>
				</div>
				</div>
				</div>`;
}

const models = JSON.parse(fs.readFileSync('src/data/models.json', 'utf8'));
const locs = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));

console.log('Sample rendered model card length:', renderModelLoopItem(models[0]).length);
console.log('Sample rendered location card length:', renderLocationLoopItem(locs[0]).length);
