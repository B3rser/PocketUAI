import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import React from 'react';
import { Card, Typography, Box } from '@mui/material';

export function DndAreaExpenses({ cardsList }) {
    const [state, setState] = React.useState(cardsList);

    function onDragEnd(result) {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const area = state.areas[source.droppableId];
        const newActionIds = Array.from(area.actionIds)
        newActionIds.splice(source.index, 1)
        newActionIds.splice(destination.index, 0, draggableId)


        const newArea = {
            ...area,
            actionIds: newActionIds
        }

        const newState = {
            ...state,
            areas: {
                ...state.areas,
                [newArea.id]: newArea,
            }
        }

        setState(newState);
    }

    return (
        <DragDropContext
            onDragEnd={onDragEnd}
        >
            {state.areaOrder.map(areaId => {
                const area = state.areas[areaId];
                const actions = area.actionIds.map(actionId => state.actions[actionId])
                return <Area key={area.id} area={area} actions={actions} />
            })}
        </DragDropContext>
    )
}

function Area({ area, actions }) {
    return (
        <Box >
            <Droppable droppableId={area.id} direction='vertical'>
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {
                            actions.map((card, index) => (
                                <DndCard key={card.id} card={card} index={index} />
                            ))
                        }
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Box>
    )
}

export function DndCard({ card, index }) {
    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided) => (
                <Card
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    sx={{ padding: 1, width: "100%", height: 50, boxShadow: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', padding: 0, flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <Box display="flex" flexDirection="row" alignItems={'center'} >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                                {card.icon}
                            </Box>
                            <Box marginLeft="10px" textAlign='left'>
                                <Typography variant="body1" component="div">
                                    {card.category}
                                </Typography>
                                {/* <Typography variant="body2" color="text.secondary">
                                    {card.category}
                                </Typography> */}
                            </Box>
                        </Box>

                        <Typography variant="body1" component="div">
                            {new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(card.amount)}
                        </Typography>
                    </Box>
                </Card>
            )
            }
        </Draggable >
    )
}