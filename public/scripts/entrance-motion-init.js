// public/scripts/entrance-motion-init.js
// Nicole Smooth Scroll and Scroll-Driven Progressive Reveals

(function () {
	// 1. Accessibility Check
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// 2. Lenis Smooth Scroll Initialization
	let lenis = null;
	if (!prefersReducedMotion && typeof window.Lenis !== "undefined") {
		try {
			lenis = new window.Lenis({
				duration: 1.15, // 自然で上品な慣性スクロール
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 指数イージング
				orientation: "vertical",
				gestureOrientation: "vertical",
				smoothWheel: true,
				wheelMultiplier: 0.95,
				touchMultiplier: 1.5,
				infinite: false,
			});

			function raf(time) {
				lenis.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
			window.__lenisInstance = lenis;
		} catch (e) {
			console.warn("[Motion] Lenis init skipped:", e);
		}
	}

	// 3. Scroll Reveal Observer (IntersectionObserver)
	const initObserver = () => {
		const revealElements = document.querySelectorAll(
			".motion-reveal, .motion-reveal--scale, .motion-reveal--slide-left, .motion-stagger-wave, [data-motion-reveal]"
		);

		if ("IntersectionObserver" in window) {
			const observer = new IntersectionObserver(
				(entries, obs) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add("is-inview");
							// 一度表示されたら監視解除
							obs.unobserve(entry.target);
						}
					});
				},
				{
					root: null,
					rootMargin: "0px 0px -6% 0px", // 画面下部から6%手前で滑らかに発火
					threshold: 0.05,
				}
			);

			revealElements.forEach((el) => observer.observe(el));
		} else {
			revealElements.forEach((el) => el.classList.add("is-inview"));
		}
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initObserver);
	} else {
		initObserver();
	}
})();
