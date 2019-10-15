import React, { useState } from "react";
import { Icon, Input } from "antd";
import { motion } from "framer-motion";
import { Draggable } from "react-beautiful-dnd";

import { Map } from "./";
import BusStopModel from "../models/bus-stop";

const BusStop = props => {
  const { index, stop, handleDelete, handleEdit } = props;
  const { name, coordinates } = stop;

  const [active, setActive] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedStop, setEditedStop] = useState({
    name: name,
    lat: coordinates.lat,
    lng: coordinates.lng
  });

  const handleMapRender = e => {
    if (active) return;
    setActive(true);
  };

  const activateEdit = () => {
    setEditing(!editing);

    if (!editing) {
      const data = {
        ...stop,
        name: editedStop.name,
        coordinates: {
          lat: editedStop.lat,
          lng: editedStop.lng
        }
      };
      const busStop = new BusStopModel(data);
      handleEdit({
        index,
        stop: busStop
      });
    }
  };

  const handleStopEdit = e => {
    const { name, value } = e.target;

    setEditedStop({
      ...editedStop,
      [name]: value
    });
  };

  return (
    <Draggable draggableId={stop.id} index={index}>
      {provided => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <motion.div className="cell grid-y bus-stop" key={index}>
            <div className="cell">
              <div className="grid-x align-justify">
                <p className="font-bold">
                  {!editing ? (
                    editedStop.name
                  ) : (
                    <Input
                      size="small"
                      name="name"
                      value={editedStop.name}
                      onChange={handleStopEdit}
                    />
                  )}
                </p>
                <div className="grid-x">
                  <div onClick={() => activateEdit()}>
                    {editing ? <Icon type="check" /> : <Icon type="edit" />}
                  </div>
                  {!editing && (
                    <div onClick={() => handleDelete(stop)}>
                      <Icon
                        type="close-circle"
                        theme="filled"
                        className="bus-stop__close-btn"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Map
                index={index}
                stop={stop}
                active={active}
                onClick={handleMapRender}
              ></Map>
              <div className="grid-x">
                <p className="cell small-6 grid-y">
                  <strong>Long: </strong>
                  <span>
                    {!editing ? (
                      editedStop.lng
                    ) : (
                      <Input
                        size="small"
                        name="lng"
                        value={editedStop.lng}
                        onBlur={handleStopEdit}
                        onChange={handleStopEdit}
                      />
                    )}
                  </span>
                </p>
                <p className="cell small-6 grid-y">
                  <strong>Lat: </strong>
                  <span>
                    {!editing ? (
                      editedStop.lat
                    ) : (
                      <Input
                        size="small"
                        name="lat"
                        value={editedStop.lat}
                        onChange={handleStopEdit}
                      />
                    )}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

export default BusStop;
