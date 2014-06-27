
/**
 * Google Map Picker Directive
 *
 * @status Draft
 */
app.directive('googleMapPicker', ['$timeout', function ($timeout) {
    return {
        restrict: 'ACE',
        controller: function ($scope, $element) { console.log('-> controller');
            $scope.setPosition = function (position) {
                $scope._gmp.marker.setPosition(position);
                $scope._gmp.map.panTo(position);

                $scope._gmp.zoom = $scope._gmp.map.getZoom();
                $scope._gmp.lng = position.lng();
                $scope._gmp.lat = position.lat();

                $scope.$apply();

                $element.trigger('location_changed', $element);

                $scope.getLocationName(position);
            }; // setPosition

            // for reverse geocoding
            $scope.getLocationName = function (position) {
                var latlng = new google.maps.LatLng(position.lat(), position.lng());

                $scope._gmp.geocoder.geocode({
                    latLng: latlng
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK && results[1]) {
                        $scope._gmp.locationName = results[1].formatted_address;
                    } else {
                        $scope._gmp.locationName = '';
                    }

                    $scope.$apply();

                    $element.trigger('location_name_changed', $element);
                });
            }; // getLocationName

            // search function
            $scope.performSearch = function (string, silent) {
                if (string == "") {
                    if (!silent) {
                        alert('Couldn\'t find coordinates for this place');
                    }

                    return;
                }

                $scope._gmp.geocoder.geocode({
                    address: string
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $scope._gmp.zoom = 11;

                        $scope.$apply();

                        $scope._gmp.map.setZoom(parseInt($scope._gmp.zoom));

                        $scope.setPosition(results[0].geometry.location);
                    } else {
                        if (!silent) {
                            alert('Couldn\'t find coordinates for this place');
                        }
                    }
                });
            }; // performSearch

            $timeout(function () {
                if (!$element.attr('id')) {
                    $element.attr('id', $element.attr('name') || '_MAP_' + Math.ceil(Math.random() * 10000));
                }

                $scope._gmp = angular.extend({}, {
                    id: $element.attr('id'),
                    lat: $element.attr('data-lat') || 0,
                    lng: $element.attr('data-lng') || 0,
                    markerText: $element.attr('data-markertext'),
                    zoom: parseInt($element.attr('data-zoom')) || 5
                });

                $scope._gmp.latlng = new google.maps.LatLng($scope._gmp.lat, $scope._gmp.lng);

                $scope._gmp.options = angular.extend({}, {
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    disableDoubleClickZoom: true,
                    zoomControlOptions: true,
                    scrollwheel: false,
                    streetViewControl: false,
                    zoom: $scope._gmp.zoom,
                    center: $scope._gmp.latlng
                }, $element.attr('data-options'));


                $scope._gmp.map = new google.maps.Map($element.get(0), $scope._gmp.options);
                $scope._gmp.geocoder = new google.maps.Geocoder();

                $scope._gmp.marker = new google.maps.Marker({
                    position: $scope._gmp.latlng,
                    map: $scope._gmp.map,
                    title: $scope._gmp.markerText,
                    draggable: true
                });

                // Set position on doubleclick
                google.maps.event.addListener($scope._gmp.map, 'dblclick', function (e) {
                    $scope.setPosition(e.latLng);
                });

                // Set position on marker move
                google.maps.event.addListener($scope._gmp.marker, 'dragend', function (e) { console.log($scope._gmp.marker.position);
                    $scope.setPosition($scope._gmp.marker.position);
                });

                // Set zoom feld's value when user changes zoom on the map
                google.maps.event.addListener($scope._gmp.map, 'zoom_changed', function (e) {
                    $scope._gmp.zoom = $scope._gmp.map.getZoom();

                    $element.trigger('location_changed', $element);
                });

                // Update location and zoom values based on input field's value
                /*$(_self.vars.cssID + ".gllpUpdateButton").bind("click", function() {
                 var lat = $(_self.vars.cssID + ".gllpLatitude").val();
                 var lng = $(_self.vars.cssID + ".gllpLongitude").val();
                 var latlng = new google.maps.LatLng(lat, lng);
                 _self.vars.map.setZoom( parseInt( $(_self.vars.cssID + ".gllpZoom").val() ) );
                 setPosition(latlng);
                 });

                 // Search function by search button
                 $(_self.vars.cssID + ".gllpSearchButton").bind("click", function() {
                 performSearch( $(_self.vars.cssID + ".gllpSearchField").val(), false );
                 });

                 // Search function by gllp_perform_search listener
                 $(document).bind("gllp_perform_search", function(e, object) {
                 performSearch( $(object).attr('string'), true );
                 });

                 // Zoom function triggered by gllp_perform_zoom listener
                 $(document).bind("gllp_update_fields", function(e) {
                 var lat = $(_self.vars.cssID + ".gllpLatitude").val();
                 var lng = $(_self.vars.cssID + ".gllpLongitude").val();
                 var latlng = new google.maps.LatLng(lat, lng);
                 $scope._gmp.map.setZoom( parseInt( $(_self.vars.cssID + ".gllpZoom").val() ) );
                 setPosition(latlng);
                 });*/

                $scope._gmp.map.setCenter($scope._gmp.marker.getPosition());


                if ($scope._gmp.lat == 0 || $scope._gmp.lng == 0) {
                    var initialLocation;

                    // Try W3C Geolocation (Preferred)
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

                            $scope.setPosition(initialLocation);
                        });
                    }
                }
            });
        }
    };
}]); // googleMapPicker
