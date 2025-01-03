import { UUIIconRegistryElement } from "@umbraco-cms/backoffice/external/uui";

const moveSvg = "<svg viewBox=\"0 0 32.242 32.242\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m13.025 29.137-3.0772-3.1048 1.2774-1.5392 1.8465 1.803 1.8465 1.803v-10.776h-10.776l3.6061 3.6929-1.5392 1.2775-3.1048-3.0772-3.1048-3.0772 3.0997-3.0997 3.0998-3.0997 1.5493 1.2858-1.803 1.8465-1.803 1.8465h10.776v-10.776l-1.8465 1.803-1.8465 1.803-1.2858-1.5493 3.0997-3.0998 3.0997-3.0997 3.0772 3.1048 3.0772 3.1048-0.63873 0.76959-0.63873 0.76963-3.6929-3.6061v10.776h10.776l-1.803-1.8465-1.803-1.8465 1.5493-1.2858 6.1995 6.1995-6.2096 6.1544-1.5392-1.2775 3.6061-3.6929h-10.776v10.776l3.6929-3.6061 1.2858 1.5493-3.0997 3.0997-3.0997 3.0997z\" stroke-width=\"1.8177\"/></svg>"
const penSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\"  xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 22.977492,0.53769475 21.923088,1.1266469 20.868138,1.716664 10.851847,12.712923 0.83555656,23.708648 v 4.66742 4.667419 H 5.0635523 9.2915481 L 19.25266,21.986523 29.213225,10.929026 29.748077,9.7649673 30.281834,8.6009076 V 7.2073382 5.8137688 L 29.533918,4.2178469 28.786548,2.6224575 27.240999,1.5819399 25.695997,0.54195478 24.336198,0.53929227 Z M 22.875334,3.2018246 h 1.531344 1.530252 L 26.902829,4.26737 27.868183,5.3339804 V 7.115747 8.8985787 L 26.996246,9.7692272 26.125407,10.639343 23.601393,7.8186556 21.07738,4.9979688 21.976628,4.0996304 Z m -3.214024,3.4767346 2.530569,2.7929961 2.531117,2.7940617 -7.970311,8.798072 -7.9703101,8.798072 -2.5207356,-2.816959 -2.519643,-2.816427 7.9593837,-8.775174 z m 12.412464,6.3916758 c -0.639788,-0.0079 -2.218951,0.941648 -3.247521,1.625937 -1.371428,0.912387 -2.370864,1.959319 -3.541919,3.7167 -1.151875,1.728598 -1.377838,4.050134 -0.430891,5.408108 0.946947,1.357974 2.113828,1.972479 3.251698,2.663064 1.165063,0.707088 1.307015,1.829049 0.142379,2.508037 -1.164636,0.678986 -2.500108,0.78396 -4.932761,0.815786 -2.432654,0.03183 -4.739311,0.296345 -6.654949,0.338785 -1.915638,0.04243 -3.134563,0.211898 -3.635235,0.615045 -0.500673,0.403148 -0.282908,1.039704 2.133392,1.379191 2.4163,0.339487 7.031265,0.381767 10.296555,0.233238 3.26529,-0.148529 5.180591,-0.487779 6.39963,-1.866968 1.21904,-1.379189 1.741728,-3.798144 0.762121,-5.113658 -0.979606,-1.315515 -3.015786,-1.890155 -4.069799,-2.809069 -1.219742,-1.063401 -0.915355,-2.410576 0.08601,-3.789752 1.001365,-1.379177 1.782654,-2.00428 2.653396,-2.980314 0.870741,-0.976034 1.830996,-2.302856 1.308541,-2.621122 -0.130614,-0.07956 -0.307383,-0.120357 -0.520647,-0.123008 z M 3.2492127,27.52885 4.4560409,28.78024 5.662869,30.03163 v 0.173065 0.174662 H 4.4560409 3.2492127 v -1.42552 z\"/></svg>";
const spraySvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m 27.72821,0.52954196 -0.562797,0.51951474 -0.562817,0.5195169 0.380131,0.5676956 0.380107,0.5676953 0.84649,-0.1518726 0.847608,-0.1518727 0.22353,-0.6200656 0.22355,-0.6211133 -0.887329,-0.31422418 z m -3.424493,2.15556884 -0.736416,0.6787228 -0.736415,0.6797687 0.364235,0.5446519 0.364232,0.5436063 h 0.792012 0.793154 L 25.47472,4.3368769 25.804918,3.5418934 25.053747,3.1135021 Z M 8.9683424,4.1389155 V 6.1635591 8.1882013 L 6.5468974,11.09267 4.1254739,13.997136 v 9.474867 9.474861 h 8.8778271 8.878972 V 23.59874 14.251656 L 19.705939,11.554577 17.529586,8.8574953 17.015579,8.6920013 16.50155,8.5265083 V 6.3321859 4.1389093 h -3.767163 z m 18.7598676,0.8609699 -0.586642,0.5415124 -0.586621,0.5415104 0.7035,0.7834611 0.703502,0.7824146 0.59233,-0.1822551 L 29.145444,7.2853274 29.320227,6.4557798 29.49501,5.6262321 28.611083,5.3130557 Z M 19.726362,5.0585424 19.380286,5.8901858 19.03419,6.7228771 19.73657,7.1229875 20.438953,7.524144 21.186699,7.2591511 21.934465,6.9941571 21.767587,6.1928881 21.60071,5.3916189 20.66347,5.2250717 Z m -8.067681,0.9981823 1.210722,0.1581559 1.209582,0.1592099 0.172588,1.117587 0.172366,1.1175844 H 13.04074 11.658681 V 7.3324722 Z m 12.303485,1.4265716 -0.562796,0.5195145 -0.56282,0.519515 0.380131,0.5676956 0.380111,0.567696 0.846488,-0.1518733 0.846468,-0.1518722 0.22467,-0.621115 0.223552,-0.6200656 -0.888475,-0.3142219 z m 4.107594,2.1545221 -0.736414,0.6797686 -0.736416,0.67977 0.364234,0.543606 0.365374,0.544652 h 0.792014 0.792011 l 0.3302,-0.794986 0.331319,-0.794983 -0.751173,-0.428391 z M 9.5436332,11.092671 h 3.4596678 3.459671 l 0.576431,0.992944 0.575291,0.99399 H 13.003301 8.3919111 l 0.5764313,-0.99399 z m -2.7278204,4.470344 h 6.1874882 6.188611 v 7.698459 7.698458 H 13.003301 6.8158128 v -7.698458 z\" /></svg>"
const rotateSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 12.389424 0.46353757 L 9.6495396 1.6820678 L 6.9091386 2.9000812 L 4.8880735 4.8689532 L 2.8670083 6.8383419 L 1.6474446 9.6371373 L 0.42788083 12.435933 L 0.4211629 15.724104 L 0.41496173 18.776631 L 3.0731973 18.776631 L 3.0731973 15.681212 L 3.0731973 11.801863 L 4.7320106 9.1193395 L 6.3903073 6.436816 L 9.0728307 4.7785194 L 11.755354 3.1202228 L 15.634187 3.1202228 L 19.513536 3.1202228 L 22.091157 4.6353757 L 24.668777 6.1505286 L 25.515754 7.3602738 L 26.363247 8.570019 L 26.363247 8.9958328 L 26.363247 9.4221634 L 24.171133 9.4221634 L 21.979536 9.4221634 L 21.979536 10.51822 L 21.979536 11.613761 L 26.637132 11.613761 L 31.295246 11.613761 L 31.295246 7.2300492 L 31.295246 2.845821 L 29.925303 2.845821 L 28.555361 2.845821 L 28.555361 4.8751543 L 28.555361 6.9044877 L 26.50019 4.9020261 L 24.445535 2.9000812 L 21.705134 1.6820678 L 18.96525 0.46353757 L 15.677078 0.46353757 L 12.389424 0.46353757 z M 28.822012 13.870987 L 28.822012 16.966405 L 28.822012 20.845755 L 27.163198 23.528278 L 25.504902 26.210802 L 22.822378 27.869098 L 20.139855 29.527395 L 16.261022 29.527395 L 12.381672 29.527395 L 9.8040522 28.012242 L 7.2264319 26.497089 L 6.3794552 25.287344 L 5.5319618 24.077599 L 5.5319618 23.651785 L 5.5319618 23.225454 L 7.7240759 23.225454 L 9.9156733 23.225454 L 9.9156733 22.129397 L 9.9156733 21.033857 L 5.2580767 21.033857 L 0.59996334 21.033857 L 0.59996334 25.417569 L 0.59996334 29.801797 L 1.9699055 29.801797 L 3.3398476 29.801797 L 3.3398476 27.772463 L 3.3398476 25.74313 L 5.3950192 27.745592 L 7.4496741 29.747537 L 10.190075 30.96555 L 12.929959 32.18408 L 16.218131 32.18408 L 19.505785 32.18408 L 22.245669 30.96555 L 24.98607 29.747537 L 27.007135 27.778665 L 29.028201 25.809276 L 30.247764 23.01048 L 31.467328 20.211685 L 31.474046 16.923514 L 31.480247 13.870987 L 28.822012 13.870987 z \" /></svg>";
const cropSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 5.7980956,0.7095174 V 28.115596 H 33.204174 V 25.092007 H 8.8211669 V 0.7095174 Z M 0.25011392,4.6699991 V 7.6930703 H 4.3511886 V 4.6699991 Z m 9.90963708,0 V 7.6930703 H 26.220104 V 23.625992 h 3.023589 V 4.6699991 Z M 26.220104,29.096931 v 4.566647 h 3.023589 v -4.566647 z\" /></svg>";
const adjustmentsSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 6.1119587,32.169543 3.8803728,30.994413 2.3846523,28.876364 0.88897325,26.758295 0.68544434,23.570514 0.48191544,20.382755 1.5183632,18.356378 2.5548108,16.329959 4.4471129,14.672745 6.3394565,13.015532 6.4611605,10.614263 6.5828646,8.2129938 7.5874296,6.2587514 8.5919945,4.3044885 9.7874428,3.1922391 10.982912,2.0799897 12.858539,1.2983011 14.734166,0.51663303 h 2.311076 2.311096 l 1.875628,0.78166807 1.875627,0.7816886 1.195448,1.1122494 1.195468,1.1122494 1.004565,1.9542629 1.004565,1.9542424 0.121705,2.4012692 0.121703,2.401269 1.892302,1.657213 1.892344,1.657214 0.982869,1.921638 0.982848,1.921618 v 2.718433 2.718454 l -1.178153,2.225879 -1.178132,2.2259 -2.110482,1.482711 -2.110481,1.482731 -3.071364,0.221596 -3.071365,0.221597 -1.928709,-0.867528 -1.92871,-0.867487 -1.5599,0.804586 -1.55992,0.804586 H 11.073786 8.3434 Z m 8.3019343,-1.820216 0.406582,-0.391505 -1.087175,-1.8379 -1.087175,-1.83792 -0.26779,-2.945657 -0.26779,-2.945615 -1.378604,-0.924185 -1.3786037,-0.924164 -0.9642724,-1.43572 -0.9642931,-1.435721 -0.4297662,-0.0014 -0.429787,-0.0014 -1.4618541,1.560925 -1.4618541,1.560883 -0.5330184,1.97442 -0.5330391,1.97444 0.5507265,2.039958 0.5507058,2.039959 1.3676109,1.516531 1.3676109,1.516511 2.0253709,0.730721 2.0253701,0.730741 1.772231,-0.286167 1.77221,-0.286126 z m 12.569592,-0.320668 1.365256,-0.704176 1.055664,-1.338648 1.055684,-1.338648 0.527585,-1.954242 0.527584,-1.954242 -0.533019,-1.974441 -0.533039,-1.974419 -1.461854,-1.560884 -1.461854,-1.560925 -0.429766,0.0014 -0.429787,0.0014 -0.964293,1.435721 -0.964252,1.43572 -1.378604,0.924164 -1.378603,0.924185 -0.26779,2.945616 -0.26779,2.945656 -1.087175,1.83792 -1.087195,1.8379 0.406603,0.381797 0.406603,0.381776 1.012685,0.2582 1.012685,0.258199 1.75473,-0.25247 1.754707,-0.25249 z m -8.476782,-3.452184 0.817216,-1.717724 v -1.691344 -1.691323 h -2.278553 -2.278573 v 1.691323 1.691344 l 0.817215,1.717724 0.817235,1.717724 h 0.644123 0.644122 z m -0.19547,-7.777151 v -0.404035 l -0.595586,-0.594037 -0.595543,-0.594036 -0.670323,0.554878 -0.670282,0.554857 v 0.443214 0.443193 h 1.265867 1.265867 z m -4.106139,-1.949153 0.613521,-1.343099 -0.658835,-0.416813 -0.658855,-0.416833 -1.928668,-0.0083 -1.9286689,-0.0083 0.3583759,0.631299 0.358377,0.63132 1.025619,1.136362 1.025642,1.136342 h 0.589965 0.590007 z m 8.499656,0.206758 1.02562,-1.136362 0.358397,-0.63132 0.358397,-0.631299 -1.92871,0.0083 -1.928669,0.0083 -0.658854,0.416834 -0.658815,0.416833 0.613522,1.3431 0.61352,1.3431 h 0.589986 0.589986 z m 0.543349,-4.91313 2.151972,-0.01237 V 10.852574 9.5737562 L 24.715988,7.9406764 24.031882,6.3075967 22.243452,4.7413752 20.455042,3.1751536 18.631114,2.8338552 16.807206,2.4925775 14.883125,3.0093477 12.959043,3.526118 11.362239,5.1772932 9.7654575,6.8284271 9.2280379,8.2501945 8.6906389,9.6719413 v 1.2297467 1.229745 l 2.1519721,0.01237 2.151972,0.01237 2.025391,0.911386 2.025392,0.911366 2.025371,-0.91353 2.025391,-0.913509 z\"/></svg>";
const saveSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 2.7626219 0.3488159 C 1.3954856 0.3488159 0.29507241 1.4492291 0.29507241 2.8163654 L 0.29507241 29.425076 C 0.29507241 30.792212 1.3954856 31.893142 2.7626219 31.893142 L 29.478819 31.893142 C 30.845955 31.893142 31.946885 30.792212 31.946885 29.425076 L 31.959804 5.6999102 A 1.6471198 1.6471198 0 0 0 31.415135 4.474662 L 27.319261 0.78651525 A 1.7047588 1.7047588 0 0 0 26.178762 0.3488159 L 2.7626219 0.3488159 z M 11.323339 2.8752765 L 25.702306 2.8752765 C 26.510914 2.8752765 27.161648 3.5265278 27.161648 4.3351357 L 27.161648 11.885579 C 27.161648 12.694187 26.510914 13.344921 25.702306 13.344921 L 11.323339 13.344921 C 10.514731 13.344921 9.8634801 12.694187 9.8634801 11.885579 L 9.8634801 4.3351357 C 9.8634801 3.5265278 10.514731 2.8752765 11.323339 2.8752765 z M 20.939806 3.641638 L 20.939806 12.290722 L 24.656891 12.290722 L 24.656891 3.641638 L 20.939806 3.641638 z M 4.5532102 16.539558 L 27.161648 16.539558 L 27.161648 25.865603 C 27.161648 29.054808 27.153513 29.020449 24.761795 29.020449 L 6.9525468 29.020449 C 4.5608312 29.020449 4.5532102 28.903074 4.5532102 25.865603 L 4.5532102 16.539558 z \" /></svg>";
const exitSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 10.933182 0.94826248 C 10.486977 0.94826248 9.7394007 0.93328498 9.3477493 1.137915 C 9.0457962 1.2956794 8.798686 1.5424774 8.6408157 1.8443318 C 8.436021 2.2359076 8.4511633 2.9835596 8.4511633 3.4297646 L 8.4511633 9.2025385 A 0.80792559 0.80792559 0 0 0 9.2588658 10.010241 L 10.044348 10.010241 A 0.80792559 0.80792559 0 0 0 10.85205 9.2025385 L 10.85205 4.2111122 A 0.80792559 0.80792559 0 0 1 11.66027 3.4034096 L 28.39103 3.4034096 A 0.80792559 0.80792559 0 0 1 29.198733 4.2111122 L 29.198733 28.259772 A 0.80792559 0.80792559 0 0 1 28.39103 29.067475 L 11.66027 29.067475 A 0.80792559 0.80792559 0 0 1 10.85205 28.259772 L 10.85205 23.268346 A 0.80792559 0.80792559 0 0 0 10.044348 22.460126 L 9.2588658 22.460126 A 0.80792559 0.80792559 0 0 0 8.4511633 23.268346 L 8.4511633 29.04112 C 8.4511633 29.487325 8.4361066 30.23443 8.6408157 30.626036 C 8.7986836 30.928035 9.0457537 31.175096 9.3477493 31.332969 C 9.7393665 31.537694 10.486977 31.523139 10.933182 31.523139 L 29.227155 31.523139 C 29.67336 31.523139 30.421023 31.537749 30.812588 31.332969 C 31.114445 31.175105 31.361235 30.927986 31.519005 30.626036 C 31.723649 30.234374 31.708657 29.487325 31.708657 29.04112 L 31.708657 3.4297646 C 31.708657 2.9835596 31.723705 2.2359425 31.519005 1.8443318 C 31.361243 1.5425201 31.114396 1.2956815 30.812588 1.137915 C 30.420967 0.93320005 29.67336 0.94826248 29.227155 0.94826248 L 10.933182 0.94826248 z M 6.1996212 9.9399612 L 0 16.139066 L 6.2094397 22.293728 L 7.7488806 21.016287 L 4.1428993 17.323489 L 20.594607 17.323489 L 20.594607 14.918468 L 4.1428993 14.918468 L 7.7488806 11.225671 L 6.1996212 9.9399612 z \" /></svg>";
const flipVerticalSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 15.703066,0.44067875 V 4.99478 h 2.529939 V 0.44067875 Z M 33.412629,3.7442158 20.257167,16.871932 33.412627,29.788377 Z M 0.5234428,4.4890044 V 30.027394 L 13.678903,16.900743 Z M 15.703066,7.5247168 v 4.5541002 h 2.529939 V 7.5247168 Z M 2.5476062,9.5488803 H 2.9392087 3.3318766 C 5.7685527,12.003482 8.2064416,14.45688 10.64426,16.910347 L 3.2827933,24.22273 H 2.914666 2.5476062 Z m 28.1056718,0 h 0.368128 0.367059 V 24.22273 h -0.391602 -0.392668 c -2.436714,-2.454211 -4.874032,-4.907822 -7.311316,-7.361467 2.453857,-2.437068 4.90711,-4.874743 7.360399,-7.3123827 z M 15.703066,14.608754 v 4.5541 h 2.529939 v -4.5541 z m 0,7.084039 v 4.5541 h 2.529939 v -4.5541 z m 0,7.084037 v 4.5541 h 2.529939 v -4.5541 z\" /></svg>";
const flipHorizontalSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 33.413162,15.620834 H 28.85906 v 2.529939 h 4.554102 z M 30.109624,33.330397 16.981908,20.174935 4.0654633,33.330395 Z M 29.364836,0.44121127 H 3.8264463 L 16.953097,13.596671 Z M 26.329123,15.620834 h -4.5541 v 2.529939 h 4.5541 z M 24.30496,2.4653747 v 0.3916025 0.3926679 c -2.454602,2.4366761 -4.908,4.874565 -7.361467,7.3123829 L 9.6311103,3.2005618 V 2.8324345 2.4653747 Z m 0,28.1056713 v 0.368128 0.367059 H 9.6311103 v -0.391602 -0.392668 c 2.4542107,-2.436714 4.9078217,-4.874032 7.3614667,-7.311316 2.437068,2.453857 4.874743,4.90711 7.312383,7.360399 z M 19.245086,15.620834 h -4.5541 v 2.529939 h 4.5541 z m -7.084039,0 H 7.6069473 v 2.529939 h 4.5540997 z m -7.0840367,0 H 0.52291028 v 2.529939 H 5.0770103 Z\" /></svg>";
const redoSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 3.6656549,26.869196 0.76391268,22.293609 V 17.504317 L 2.2571707,13.862465 4.8723784,11.491211 7.5853832,10.123736 28.358762,9.7080674 24.884405,6.3887423 l 1.712256,-1.7219589 6.506092,6.4827956 -6.903579,6.850689 -1.58824,-1.723232 4.119218,-4.241901 -20.1499182,0.350548 -2.540474,1.135173 -1.658215,1.505023 -1.0827292,2.580221 0.1061699,4.513287 1.7949035,2.700611 2.8908066,1.710145 4.4213284,0.0019 4.42135,0.0019 v 2.526479 l -4.42135,-4.12e-4 -4.4213284,-3.92e-4 z\"</svg>";
const undoSvg = "<svg viewBox=\"0 0 33.866666 33.866666\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m 30.201011,26.938926 2.901742,-4.575587 V 17.574047 L 31.609495,13.932195 28.994287,11.560941 26.281282,10.193466 5.5079039,9.7777977 l 3.474357,-3.319325 -1.712256,-1.721959 -6.50609206,6.4827953 6.90357906,6.850689 1.58824,-1.723232 -4.119218,-4.241901 20.1499181,0.350548 2.540474,1.135173 1.658215,1.505023 1.082729,2.580221 -0.10617,4.513287 -1.794903,2.700611 -2.890807,1.710145 -4.421328,0.0019 -4.42135,0.0019 v 2.526479 l 4.42135,-4.12e-4 4.421328,-3.92e-4 z\"</svg>";
const brightnessSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 14.939895,0.31965752 V 4.694221 h 2.430203 V 0.31965752 Z M 5.713137,3.9921249 4.0526851,5.6525768 7.2284307,8.8579841 8.7880354,7.0670233 Z m 20.883718,0 -3.074898,3.0748984 1.754769,1.7305263 2.981612,-3.1449728 z M 13.929276,7.1244239 11.992237,7.7766222 10.32242,8.9652691 9.5311489,9.8682673 8.7388462,10.770234 l -1.0027844,1.36711 -0.572598,1.743669 -0.2950577,2.257155 0.2950577,2.204541 0.7326487,1.829745 1.1081965,1.777111 0.9019668,0.789228 0.9019672,0.79024 1.458538,0.769751 1.458538,0.769751 2.332816,0.234427 2.332836,-0.194157 1.68899,-0.680903 1.314494,-0.706715 1.277495,-1.00689 1.010292,-1.139976 0.866766,-1.401583 0.59752,-1.829746 0.187764,-2.199409 -0.187764,-2.25307 -0.731637,-1.910216 -0.97406,-1.427374 L 22.403716,9.4923866 21.501749,8.700084 20.053138,7.7519581 18.390971,7.1247016 h -2.231363 z m -0.413051,2.4302029 h 1.42367 v 6.5618552 6.561836 h -1.42367 L 11.643581,21.363472 10.092818,19.673118 9.3954823,17.906241 9.1273018,16.085719 9.3201293,14.238207 10.103072,12.551636 11.380464,10.89219 Z m 3.853873,0 h 1.424701 l 1.947977,1.1497992 1.464144,1.84721 0.729296,1.767041 0.246474,1.767042 -0.05359,1.95464 -0.911923,1.632759 -1.362999,1.717177 -2.059376,1.288023 H 17.370098 V 16.116482 Z M 0.3586974,14.901886 v 2.430203 h 4.3745635 v -2.430203 z m 27.2190646,0 v 2.430203 h 4.373532 V 14.901886 Z M 7.1552722,23.433729 4.080354,26.508628 5.7546526,28.158664 8.8167357,25.095193 Z m 17.9994478,0 -1.660432,1.661464 3.062083,3.090295 1.673267,-1.67686 z m -10.214825,4.104995 v 4.374564 h 2.430203 v -4.374564 z\" /></svg>";
const contrastSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 10.230263,30.576057 7.698328,29.603349 4.7129744,27.208111 2.6395977,24.544599 1.4527848,21.981737 0.64153861,19.204325 0.48059806,16.123581 0.64153861,13.096463 1.4527848,10.292209 2.6395977,7.7561698 4.8723437,5.0137593 7.6952245,2.7005236 10.311734,1.4600832 l 2.723803,-0.75759925 2.892981,-0.24141082 3.214843,0.24141082 2.750626,0.78443245 2.589687,1.2136072 2.608274,2.2595889 2.447353,2.7960573 1.186793,2.5360392 0.811266,2.804254 v 3.053941 3.053921 l -0.784443,2.723765 -1.213616,2.616509 -2.045001,2.447353 -2.956979,2.286413 -2.723803,1.32091 -2.670157,0.99903 -3.217395,0.297051 -3.163748,-0.346711 z M 21.317989,28.33131 16.327108,28.27079 v -1.90117 h 8.377922 l 1.652746,-1.494079 1.14312,-1.806339 -11.173788,-0.02682 V 20.665773 H 28.58372 l 0.523387,-1.745124 0.05365,-1.582117 H 16.327108 V 14.961946 H 29.160754 L 29.080283,13.165222 28.58372,11.634686 H 16.327108 V 9.2580989 H 27.581366 L 26.267018,7.4391801 24.593188,5.9308387 h -8.26608 V 4.02955 L 21.317989,3.969226 18.941383,2.9572007 16.089459,2.720889 13.237535,2.913752 10.807263,3.7022139 8.4843231,5.0271442 6.7312449,6.7351055 5.058637,8.3894007 3.920365,10.870686 l -0.9236652,2.588619 -0.1399371,2.690983 0.181944,2.637336 0.8698243,2.591174 1.1380781,2.242489 1.4399632,1.720558 1.5204336,1.58644 1.7750741,0.914887 1.775074,0.914886 1.789835,0.439395 1.789835,0.439394 2.082881,-0.246164 2.082882,-0.246183 z\"</svg>";
const exposureSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 0.86198228,0.8696281 H 31.584625 V 31.592258 H 0.86198228 Z M 29.457676,4.6433288 4.413595,29.701646 29.653367,29.487059 Z M 18.350256,21.666489 h 8.980464 v 2.363284 H 18.350256 Z M 2.7526073,2.8813657 V 28.040639 L 27.810923,2.9965757 Z M 8.4244804,10.795415 H 5.1158871 V 8.4321126 H 8.4244804 V 5.1235425 H 10.78776 v 3.3085701 h 3.308591 V 10.795415 H 10.78776 v 3.308571 H 8.4244804 Z\"</svg>";
const crossSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 21.586085,-20.402164 20.837731,-1.987817 2.4760015,-1.2394624 V 1.2657717 L 20.837731,2.0141263 21.586085,20.258925 h 2.505234 L 24.839673,2.0141263 43.13636,1.2657717 V -1.2394624 L 24.839673,-1.987817 24.091319,-20.402164 Z\" transform=\"rotate(45)\" /></svg>";
const checkmarkSvg = "<svg viewBox=\"0 0 32.241771 32.241757\" fill=\"currentColor\" stroke=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 31.638913,2.5170035 9.6335449,31.361565 0.76822345,19.991525 2.437992,18.408716 9.5184626,24.521395 29.929112,0.91724837 Z\" /></svg>";
const rgbSvg = "<svg viewBox=\"0 0 33.866664 33.866664\" xmlns=\"http://www.w3.org/2000/svg\"><path style=\"fill:#000be5;fill-opacity:1;stroke-width:3.26995\" d=\"M 24.854031,9.4058215 A 7.9206972,7.9206972 0 0 1 16.933334,17.32652 7.9206972,7.9206972 0 0 1 9.0126358,9.4058215 7.9206972,7.9206972 0 0 1 16.933334,1.4851243 7.9206972,7.9206972 0 0 1 24.854031,9.4058215 Z\" /><path style=\"fill:#0ea600;fill-opacity:1;stroke-width:3.26995\" d=\"m 33.307675,24.057611 a 7.9206972,7.9206972 0 0 1 -7.920697,7.920698 7.9206972,7.9206972 0 0 1 -7.920697,-7.920698 7.9206972,7.9206972 0 0 1 7.920697,-7.920697 7.9206972,7.9206972 0 0 1 7.920697,7.920697 z\" /><path style=\"fill:#e5002a;fill-opacity:1;stroke-width:3.26995\" d=\"M 16.560458,24.057611 A 7.9206972,7.9206972 0 0 1 8.6397618,31.978309 7.9206972,7.9206972 0 0 1 0.71906459,24.057611 7.9206972,7.9206972 0 0 1 8.6397618,16.136914 7.9206972,7.9206972 0 0 1 16.560458,24.057611 Z\" /></svg>";


class ImageEditorIconRegistry extends UUIIconRegistryElement {
    constructor() {        
        super();
        this.registry.defineIcon("move", moveSvg);
        this.registry.defineIcon("pen", penSvg);
        this.registry.defineIcon("spray", spraySvg);
        this.registry.defineIcon("rotate", rotateSvg);
        this.registry.defineIcon("crop", cropSvg);
        this.registry.defineIcon("save", saveSvg);
        this.registry.defineIcon("exit", exitSvg);
        this.registry.defineIcon("redo", redoSvg);
        this.registry.defineIcon("undo", undoSvg);
        this.registry.defineIcon("flip-vertical", flipVerticalSvg);
        this.registry.defineIcon("flip-horizontal", flipHorizontalSvg);
        this.registry.defineIcon("adjust", adjustmentsSvg);
        this.registry.defineIcon("brightness", brightnessSvg);
        this.registry.defineIcon("contrast", contrastSvg);
        this.registry.defineIcon("exposure", exposureSvg);
        this.registry.defineIcon("cross", crossSvg);
        this.registry.defineIcon("checkmark", checkmarkSvg);
        this.registry.defineIcon("rgb", rgbSvg);
    }
}

customElements.define('mediatools-icon-registry', ImageEditorIconRegistry);

