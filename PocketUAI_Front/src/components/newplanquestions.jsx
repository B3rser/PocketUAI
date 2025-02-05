import React from 'react'
import { NewPlanQuestion } from '../components/newplanQuestion';
import toast from 'react-hot-toast';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/auth.context';
import { userService } from '../services/user.service';
import { financialPlanService } from '../services/financialPlan.service';
import { trackingService } from '../services/tracking.service';
import { historyService } from '../services/history.service';
import { modelsService } from '../services/models.service';
import { DateService } from '../services/date.service';
import { ButtonAction } from './button_action';
import LoadingCircle from './loading_circle';

export function NewPlanQuestions() {
    const nav = useNavigate();
    const [formData, setFormData] = React.useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const questions = [
        { question: 'What is your total income per month?', field: 'income', type: 'number' },
        { question: 'How much do you spend on housing per month?', field: 'housing', type: 'number' },
        { question: 'How much do you spend on food per month?', field: 'food', type: 'number' },
        { question: 'How much do you spend on healthcare per month?', field: 'healthcare', type: 'number' },
        { question: 'How much do you spend on transportation per month?', field: 'transportation', type: 'number' },
        { question: 'How much do you spend on education per month (including tuition)?', field: 'education', type: 'number' },
        { question: 'How much do you spend on non-essential things per month?', field: 'non-essential', type: 'number' },
        { question: 'What is your main financial goal?', field: 'goal_name', type: 'text' },
        { question: 'How much money do you need to achieve your goal?', field: 'goal', type: 'number' },
        { question: 'How much money have you saved so far to achieve your goal?', field: 'last_saving', type: 'number' },
        { question: 'In how many months would you like to achieve your goal?', field: 'duration', type: 'number' },
    ];
    const tam = questions.length;

    const { user } = useAuth();
    const [error, setError] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        document.title = 'New Plan';
        load_data();
    }, []);

    const isFormComplete = questions.every(q => formData[q.field] !== undefined && formData[q.field] !== '');

    const handleChange = (field, value, type) => {
        setFormData((prev) => ({
            ...prev,
            [field]: type === "number" ? (value === "" ? null : Number(value)) : value,
        }));
    };

    const handleNext = () => {
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
    };

    const handlePrevious = () => {
        setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!isFormComplete) {
            toast.error("Please fill out all fields before submitting.");
            return;
        }

        const user_data = {
            income: formData.income,
            last_saving: formData.last_saving,
            expenses: [
                { type: "food", expense: formData.food },
                { type: "housing", expense: formData.housing },
                { type: "health", expense: formData.healthcare },
                { type: "transportation", expense: formData.transportation },
                { type: "university", expense: formData.education },
                { type: "non-essential", expense: formData["non-essential"] },
            ],
            goal: formData.goal,
            duration: formData.duration,
            goal_name: formData.goal_name,
        };

        console.log(user_data)

        try {
            const modelData = await modelsService.new_plan(user_data);
            if (modelData.status !== "success") {
                toast.error(modelData.message);
                return;
            }

            const plan = modelData.plan;
            console.log(plan)

            const userData = {
                income: user_data.income,
                expenses: user_data.expenses,
            };

            const trackingData = {
                month: 0,
                saving: user_data.last_saving,
                advance: (user_data.last_saving / user_data.income) * 100,
            };

            const historyData = {
                month: 0,
                expenses: user_data.expenses,
                saving: user_data.last_saving,
            };

            const financialPlanData = {
                goal_name: user_data.goal_name,
                goal: user_data.goal,
                duration: user_data.duration,
                date: DateService.convertToFirebaseTimestamp(new Date()),
                expenses: Object.entries(plan).map(([type, expense]) => ({
                    type,
                    expense,
                })),
                saving: user_data.last_saving,
            };

            const userResponse = await userService.updateUser(user.uid, userData);
            if (userResponse.status !== "success") {
                toast.error(userResponse.message);
                return;
            }

            const trackingResponse = await trackingService.getTracking(user.uid);
            if (trackingResponse.status === "success") {
                const updateResponse = await trackingService.updateTracking(user.uid, trackingData);
                if (updateResponse.status !== "success") {
                    toast.error(updateResponse.message);
                    return;
                }
            } else {
                const addResponse = await trackingService.addTracking(trackingData);
                if (addResponse.status !== "success") {
                    toast.error(addResponse.message);
                    return;
                }
            }

            const historyResponse = await historyService.getHistory(user.uid);

            if (historyResponse.status === "success" && historyResponse.history.length > 0) {
                const deleteHistoryResponse = await historyService.deleteAllHistory(user.uid);

                if (deleteHistoryResponse.status !== "success") {
                    toast.error(deleteHistoryResponse.message);
                    return;
                }
            }

            const addHistoryResponse = await historyService.addHistory(historyData);
            if (addHistoryResponse.status !== "success") {
                toast.error(addHistoryResponse.message);
                return;
            }

            const financialPlanResponse = await financialPlanService.getPlan(user.uid);
            if (financialPlanResponse.status === "success") {
                const updatePlanResponse = await financialPlanService.updatePlan(user.uid, financialPlanData);
                if (updatePlanResponse.status !== "success") {
                    toast.error(updatePlanResponse.message);
                    return;
                }
            } else {
                const addPlanResponse = await financialPlanService.addPlan(financialPlanData);
                if (addPlanResponse.status !== "success") {
                    toast.error(addPlanResponse.message);
                    return;
                }
            }

            toast.success("Plan created correctly!");
            nav("/home");
        } catch (error) {
            console.log(error)
            toast.error("An error occurred while processing the request.");
        }
    };

    const expenseToFieldMap = {
        food: 'food',
        housing: 'housing',
        health: 'healthcare',
        transportation: 'transportation',
        university: 'education',
        'non-essential': 'non-essential'
    };

    const load_data = async () => {
        try {
            const userData = await userService.getUser(user.uid);
            if (userData.status !== "success") {
                setError(userData.status);
                setMessage(userData.message);
                return;
            }
            const initialValues = {
                income: userData.user.income || 0,
                housing: 0,
                food: 0,
                healthcare: 0,
                transportation: 0,
                education: 0,
                'non-essential': 0,
            };

            userData.user.expenses.forEach(expense => {
                const formField = expenseToFieldMap[expense.type];
                if (formField && initialValues.hasOwnProperty(formField)) {
                    initialValues[formField] = expense.expense;
                }
            });

            setFormData(initialValues);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (error) {
        return (<ErrorMessage type={error} message={message} />);
    }

    if (loading) {
        return <LoadingCircle />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Card
                sx={{
                    borderRadius: '15px',
                    padding: 2,
                    boxShadow: 3,
                    minWidth: '800px',
                    height: '300px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignContent: 'center',
                }}
            >
                <CardContent>
                    <NewPlanQuestion
                        question={questions[currentQuestionIndex].question}
                        field={questions[currentQuestionIndex].field}
                        type={questions[currentQuestionIndex].type}
                        value={formData[questions[currentQuestionIndex].field]}
                        onChange={handleChange}
                    />

                    <Box sx={{
                        display: 'flex', gap: 2, width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <ButtonAction onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                            Previous
                        </ButtonAction>
                        {currentQuestionIndex !== questions.length - 1 && (<ButtonAction onClick={handleNext}>
                            Next
                        </ButtonAction>)}
                        {currentQuestionIndex === questions.length - 1 && (
                            <ButtonAction onClick={handleSubmit} >Submit</ButtonAction>
                        )}
                    </Box>
                    <Typography variant="h7" sx={{ marginTop: "10px" }}>
                        {currentQuestionIndex + 1} / {tam}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
