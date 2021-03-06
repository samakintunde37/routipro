import React, { useState, useContext, useRef } from "react";
import { AutoComplete, Button, Modal } from "antd";

import { RouteContext } from "../context/route-context";
import { setLoading } from "../actions/set-loading";
import { setActivePoints } from "../actions/set-route-points";
import { debounce } from "../utils/debounce";

const RouteForm = () => {
  const { route, dispatchRoute } = useContext(RouteContext);

  const [form, setForm] = useState({
    origin: {
      name: "",
      coordinates: {}
    },
    destination: {
      name: "",
      coordinates: {}
    }
  });
  const [suggestions, setSuggestions] = useState([]);

  const { google } = window;

  const {
    AutocompleteService,
    AutocompleteSessionToken,
    PlacesService,
    PlacesServiceStatus
  } = google.maps.places;
  const autocompleteService = new AutocompleteService();

  const token = useRef(new AutocompleteSessionToken());

  /**
   * * Gets the details of the place you're searching for
   * @param {Object} request The location being typed by the user
   * @param {Function} updateState The function to use in updating state
   * */
  function fetchPlaceSuggestions(request, updateState) {
    autocompleteService.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const refinedPredictions = Array.from(
          predictions,
          prediction => prediction.description
        );
        updateState(refinedPredictions);
      }
    });
  }

  /**
   * * Handles the value of the input as a controlled component
   * @param {String} name
   * @param {String} value The value of the input field
   * */
  const handleInputChange = (name, value) => {
    setForm({
      ...form,
      [name]: {
        ...form[name],
        name: value
      }
    });

    const request = {
      input: value,
      componentRestrictions: { country: "ng" },
      token: token.current,
      types: ["geocode", "establishment"]
    };

    debounce(fetchPlaceSuggestions(request, setSuggestions), 1000);
  };

  /**
   * * Handles the submission of the form and extracts the origin and destination of the inputs in the form
   * @param {EventListenerObject} e
   * */
  const handleFormSubmit = async e => {
    e.preventDefault();

    const placesService = new PlacesService(
      document.querySelector(".dummy-map")
    );

    // Handle Empty fields in form error
    if (!form.origin.name || !form.destination.name) {
      return Modal.error({
        title: "Either the origin or the destination field is empty."
      });
    }
    setLoading(dispatchRoute, true);

    const asyncFindPlace = async request => {
      return new Promise((resolve, reject) => {
        placesService.findPlaceFromQuery(request, (results, status) => {
          if (
            status === PlacesServiceStatus.OK ||
            status === PlacesServiceStatus.ZERO_RESULTS
          ) {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });
    };

    const routePoints = [form.origin, form.destination].map(async query => {
      const request = {
        query: query.name,
        fields: ["name", "geometry.location"]
      };

      return await asyncFindPlace(request);
    });

    const res = await Promise.all(routePoints);

    const origin = res[0][0];
    const destination = res[1][0];

    const newForm = {
      origin: {
        name: origin.name,
        coordinates: {
          lat: origin.geometry.location.lat(),
          lng: origin.geometry.location.lng()
        }
      },
      destination: {
        name: destination.name,
        coordinates: {
          lat: destination.geometry.location.lat(),
          lng: destination.geometry.location.lng()
        }
      }
    };

    setActivePoints(dispatchRoute, newForm);
  };

  return (
    <form className="cell grid-y form" onSubmit={handleFormSubmit}>
      <div className="cell form-group">
        <label htmlFor="start-point">Origin</label>
        <AutoComplete
          allowClear={true}
          dataSource={suggestions}
          id="origin"
          onChange={val => handleInputChange("origin", val)}
        />
      </div>
      <div className="cell form-group">
        <label htmlFor="end-point">Destination</label>
        <AutoComplete
          allowClear={true}
          id="destination"
          dataSource={suggestions}
          onChange={val => handleInputChange("destination", val)}
        />
      </div>
      <div className="cell align-center">
        <div className="form-group text-center">
          <Button
            className="button--primary"
            type="primary"
            htmlType="submit"
            loading={route.loading}
            block
          >
            Get Route Details
          </Button>
        </div>
      </div>
      <div className="dummy-map" style={{ display: "none" }}></div>
    </form>
  );
};

export default RouteForm;
