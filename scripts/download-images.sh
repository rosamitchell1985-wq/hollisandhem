#!/usr/bin/env bash
#
# download-images.sh
# ---------------------------------------------------------------
# Downloads every photo used by the Hollis & Hem storefront into
# /assets/images/. Run from the project root:
#
#     bash scripts/download-images.sh
#
# All photos come from Pexels and are free to use under the Pexels
# License (https://www.pexels.com/license/). Credits, including the
# source page for each file, are listed in /docs/image-credits.md.
#
# The site never hotlinks: these files are served from local paths.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p assets/images/hero assets/images/products assets/images/categories \
         assets/images/lifestyle assets/images/about

download() {
  local url="$1" dest="$2"
  if [ -f "$dest" ]; then
    echo "skip   $dest (already present)"
    return 0
  fi
  echo "fetch  $dest"
  curl -sSL --fail --max-time 60 -o "$dest" "$url"
}

download "https://images.pexels.com/photos/8031791/pexels-photo-8031791.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marlowe-wrap-dress-1.jpg"
download "https://images.pexels.com/photos/8053672/pexels-photo-8053672.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marlowe-wrap-dress-2.jpg"
download "https://images.pexels.com/photos/37034357/pexels-photo-37034357/free-photo-of-elegant-woman-walking-outdoors-in-stylish-dress.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marlowe-wrap-dress-3.jpg"
download "https://images.pexels.com/photos/16099136/pexels-photo-16099136.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/juniper-floral-midi-dress-1.jpg"
download "https://images.pexels.com/photos/35501782/pexels-photo-35501782.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/juniper-floral-midi-dress-2.jpg"
download "https://images.pexels.com/photos/12181901/pexels-photo-12181901.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/juniper-floral-midi-dress-3.jpg"
download "https://images.pexels.com/photos/18586865/pexels-photo-18586865/free-photo-of-elegant-woman-in-black-dress-outdoors.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/everly-black-midi-dress-1.jpg"
download "https://images.pexels.com/photos/36941400/pexels-photo-36941400/free-photo-of-stylish-woman-in-black-dress-street-fashion.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/everly-black-midi-dress-2.jpg"
download "https://images.pexels.com/photos/32741474/pexels-photo-32741474/free-photo-of-elegant-woman-walking-in-black-dress-on-city-street.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/everly-black-midi-dress-3.jpg"
download "https://images.pexels.com/photos/25945183/pexels-photo-25945183.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/soleil-polka-dot-sundress-1.jpg"
download "https://images.pexels.com/photos/7572653/pexels-photo-7572653.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/soleil-polka-dot-sundress-2.jpg"
download "https://images.pexels.com/photos/4817191/pexels-photo-4817191.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/soleil-polka-dot-sundress-3.jpg"
download "https://images.pexels.com/photos/8198047/pexels-photo-8198047.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wren-linen-midi-dress-1.jpg"
download "https://images.pexels.com/photos/15233095/pexels-photo-15233095.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wren-linen-midi-dress-2.jpg"
download "https://images.pexels.com/photos/12108706/pexels-photo-12108706.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wren-linen-midi-dress-3.jpg"
download "https://images.pexels.com/photos/18335728/pexels-photo-18335728.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/odette-velvet-dress-1.jpg"
download "https://images.pexels.com/photos/29772575/pexels-photo-29772575/free-photo-of-elegant-woman-in-evening-gown-at-night.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/odette-velvet-dress-2.jpg"
download "https://images.pexels.com/photos/37607882/pexels-photo-37607882/free-photo-of-elegant-woman-with-red-rose-in-sequined-dress.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/odette-velvet-dress-3.jpg"
download "https://images.pexels.com/photos/31018988/pexels-photo-31018988.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/camille-blush-column-dress-1.jpg"
download "https://images.pexels.com/photos/31903476/pexels-photo-31903476.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/camille-blush-column-dress-2.jpg"
download "https://images.pexels.com/photos/31903479/pexels-photo-31903479.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/camille-blush-column-dress-3.jpg"
download "https://images.pexels.com/photos/18220443/pexels-photo-18220443.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/hollis-silk-blouse-1.jpg"
download "https://images.pexels.com/photos/29090979/pexels-photo-29090979.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/hollis-silk-blouse-2.jpg"
download "https://images.pexels.com/photos/4672084/pexels-photo-4672084.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/hollis-silk-blouse-3.jpg"
download "https://images.pexels.com/photos/24205642/pexels-photo-24205642.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/poppy-rose-blouse-1.jpg"
download "https://images.pexels.com/photos/17640130/pexels-photo-17640130.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/poppy-rose-blouse-2.jpg"
download "https://images.pexels.com/photos/9558774/pexels-photo-9558774.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/poppy-rose-blouse-3.jpg"
download "https://images.pexels.com/photos/18119612/pexels-photo-18119612/free-photo-of-young-woman-in-a-white-shirt-posing-outside.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marin-poplin-shirt-1.jpg"
download "https://images.pexels.com/photos/10911780/pexels-photo-10911780.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marin-poplin-shirt-2.jpg"
download "https://images.pexels.com/photos/13915356/pexels-photo-13915356.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/marin-poplin-shirt-3.jpg"
download "https://images.pexels.com/photos/5590895/pexels-photo-5590895.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/field-cable-knit-sweater-1.jpg"
download "https://images.pexels.com/photos/14416451/pexels-photo-14416451.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/field-cable-knit-sweater-2.jpg"
download "https://images.pexels.com/photos/6630834/pexels-photo-6630834.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/field-cable-knit-sweater-3.jpg"
download "https://images.pexels.com/photos/16297940/pexels-photo-16297940.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/harbor-striped-tee-1.jpg"
download "https://images.pexels.com/photos/12611459/pexels-photo-12611459.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/harbor-striped-tee-2.jpg"
download "https://images.pexels.com/photos/6303002/pexels-photo-6303002.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/harbor-striped-tee-3.jpg"
download "https://images.pexels.com/photos/5788200/pexels-photo-5788200.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/aspen-wool-knit-sweater-1.jpg"
download "https://images.pexels.com/photos/6630848/pexels-photo-6630848.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/aspen-wool-knit-sweater-2.jpg"
download "https://images.pexels.com/photos/5709914/pexels-photo-5709914.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/aspen-wool-knit-sweater-3.jpg"
download "https://images.pexels.com/photos/13633075/pexels-photo-13633075.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lena-tie-neck-blouse-1.jpg"
download "https://images.pexels.com/photos/29692131/pexels-photo-29692131.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lena-tie-neck-blouse-2.jpg"
download "https://images.pexels.com/photos/10660540/pexels-photo-10660540.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lena-tie-neck-blouse-3.jpg"
download "https://images.pexels.com/photos/17751918/pexels-photo-17751918.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/reid-high-rise-jeans-1.jpg"
download "https://images.pexels.com/photos/38482277/pexels-photo-38482277.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/reid-high-rise-jeans-2.jpg"
download "https://images.pexels.com/photos/39030294/pexels-photo-39030294.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/reid-high-rise-jeans-3.jpg"
download "https://images.pexels.com/photos/16998405/pexels-photo-16998405.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/della-wide-leg-trousers-1.jpg"
download "https://images.pexels.com/photos/9634510/pexels-photo-9634510.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/della-wide-leg-trousers-2.jpg"
download "https://images.pexels.com/photos/7000901/pexels-photo-7000901.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/della-wide-leg-trousers-3.jpg"
download "https://images.pexels.com/photos/39457749/pexels-photo-39457749.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/nova-tailored-ankle-pant-1.jpg"
download "https://images.pexels.com/photos/7506920/pexels-photo-7506920.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/nova-tailored-ankle-pant-2.jpg"
download "https://images.pexels.com/photos/34992479/pexels-photo-34992479.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/nova-tailored-ankle-pant-3.jpg"
download "https://images.pexels.com/photos/19607463/pexels-photo-19607463.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/june-pleated-midi-skirt-1.jpg"
download "https://images.pexels.com/photos/22764052/pexels-photo-22764052.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/june-pleated-midi-skirt-2.jpg"
download "https://images.pexels.com/photos/22819827/pexels-photo-22819827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/june-pleated-midi-skirt-3.jpg"
download "https://images.pexels.com/photos/17794429/pexels-photo-17794429.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sutton-denim-skirt-1.jpg"
download "https://images.pexels.com/photos/6069824/pexels-photo-6069824.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sutton-denim-skirt-2.jpg"
download "https://images.pexels.com/photos/17793935/pexels-photo-17793935.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sutton-denim-skirt-3.jpg"
download "https://images.pexels.com/photos/7205905/pexels-photo-7205905.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/quinn-coated-straight-pant-1.jpg"
download "https://images.pexels.com/photos/12289155/pexels-photo-12289155.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/quinn-coated-straight-pant-2.jpg"
download "https://images.pexels.com/photos/30050888/pexels-photo-30050888.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/quinn-coated-straight-pant-3.jpg"
download "https://images.pexels.com/photos/4014487/pexels-photo-4014487.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/ainsley-classic-trench-coat-1.jpg"
download "https://images.pexels.com/photos/32692474/pexels-photo-32692474.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/ainsley-classic-trench-coat-2.jpg"
download "https://images.pexels.com/photos/9968536/pexels-photo-9968536.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/ainsley-classic-trench-coat-3.jpg"
download "https://images.pexels.com/photos/4816596/pexels-photo-4816596.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/bexley-relaxed-blazer-1.jpg"
download "https://images.pexels.com/photos/7970146/pexels-photo-7970146.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/bexley-relaxed-blazer-2.jpg"
download "https://images.pexels.com/photos/18054143/pexels-photo-18054143/free-photo-of-young-woman-in-white-blazer-and-jeans-posing-in-a-studio.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/bexley-relaxed-blazer-3.jpg"
download "https://images.pexels.com/photos/8865689/pexels-photo-8865689.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/piper-denim-jacket-1.jpg"
download "https://images.pexels.com/photos/17705070/pexels-photo-17705070.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/piper-denim-jacket-2.jpg"
download "https://images.pexels.com/photos/5524406/pexels-photo-5524406.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/piper-denim-jacket-3.jpg"
download "https://images.pexels.com/photos/8989555/pexels-photo-8989555.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wilder-longline-cardigan-1.jpg"
download "https://images.pexels.com/photos/7506935/pexels-photo-7506935.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wilder-longline-cardigan-2.jpg"
download "https://images.pexels.com/photos/8989860/pexels-photo-8989860.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/wilder-longline-cardigan-3.jpg"
download "https://images.pexels.com/photos/12989422/pexels-photo-12989422.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/arden-wool-overcoat-1.jpg"
download "https://images.pexels.com/photos/11447037/pexels-photo-11447037.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/arden-wool-overcoat-2.jpg"
download "https://images.pexels.com/photos/21835288/pexels-photo-21835288.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/arden-wool-overcoat-3.jpg"
download "https://images.pexels.com/photos/4830924/pexels-photo-4830924.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sloane-leather-satchel-1.jpg"
download "https://images.pexels.com/photos/27174557/pexels-photo-27174557/free-photo-of-woman-hands-holding-leather-bag.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sloane-leather-satchel-2.jpg"
download "https://images.pexels.com/photos/35666033/pexels-photo-35666033/free-photo-of-stylish-leather-handbags-duo-on-white-background.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sloane-leather-satchel-3.jpg"
download "https://images.pexels.com/photos/36455711/pexels-photo-36455711/free-photo-of-colorful-silk-scarf-on-white-shirt.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/mira-silk-scarf-1.jpg"
download "https://images.pexels.com/photos/36455708/pexels-photo-36455708/free-photo-of-colorful-geometric-patterned-silk-scarf.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/mira-silk-scarf-2.jpg"
download "https://images.pexels.com/photos/36455723/pexels-photo-36455723/free-photo-of-elegant-silk-scarf-with-gift-box-display.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/mira-silk-scarf-3.jpg"
download "https://images.pexels.com/photos/18742635/pexels-photo-18742635.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sable-sunglasses-1.jpg"
download "https://images.pexels.com/photos/8989491/pexels-photo-8989491.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sable-sunglasses-2.jpg"
download "https://images.pexels.com/photos/24018697/pexels-photo-24018697.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/sable-sunglasses-3.jpg"
download "https://images.pexels.com/photos/15785528/pexels-photo-15785528.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lark-gold-hoop-earrings-1.jpg"
download "https://images.pexels.com/photos/20033873/pexels-photo-20033873.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lark-gold-hoop-earrings-2.jpg"
download "https://images.pexels.com/photos/12452943/pexels-photo-12452943.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/lark-gold-hoop-earrings-3.jpg"
download "https://images.pexels.com/photos/35392687/pexels-photo-35392687.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/rowan-leather-belt-1.jpg"
download "https://images.pexels.com/photos/31959216/pexels-photo-31959216.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/rowan-leather-belt-2.jpg"
download "https://images.pexels.com/photos/31959217/pexels-photo-31959217.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/products/rowan-leather-belt-3.jpg"
download "https://images.pexels.com/photos/36770685/pexels-photo-36770685.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1600" "assets/images/hero/hero-autumn-collection.jpg"
download "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1600" "assets/images/hero/hero-newsletter-boutique.jpg"
download "https://images.pexels.com/photos/26760669/pexels-photo-26760669.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/categories/category-dresses.jpg"
download "https://images.pexels.com/photos/10686399/pexels-photo-10686399.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/categories/category-tops.jpg"
download "https://images.pexels.com/photos/20729717/pexels-photo-20729717.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/categories/category-bottoms.jpg"
download "https://images.pexels.com/photos/7682121/pexels-photo-7682121.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/categories/category-outerwear.jpg"
download "https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900" "assets/images/categories/category-accessories.jpg"
download "https://images.pexels.com/photos/36976922/pexels-photo-36976922.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/lifestyle/lookbook-weekend-denim.jpg"
download "https://images.pexels.com/photos/8682792/pexels-photo-8682792.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/lifestyle/lookbook-workday-tailoring.jpg"
download "https://images.pexels.com/photos/17071342/pexels-photo-17071342.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/lifestyle/lookbook-slow-sunday.jpg"
download "https://images.pexels.com/photos/4153423/pexels-photo-4153423.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/lifestyle/lookbook-occasion-dressing.jpg"
download "https://images.pexels.com/photos/7148007/pexels-photo-7148007.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/about/about-atelier-measuring.jpg"
download "https://images.pexels.com/photos/9849637/pexels-photo-9849637.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/about/about-fabric-selection.jpg"
download "https://images.pexels.com/photos/8306375/pexels-photo-8306375.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200" "assets/images/about/about-boutique-floor.jpg"

echo "Done. All images are stored locally under assets/images/."
