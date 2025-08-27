import axios from "axios";

export const doesUserExist = async (userId) => {
    try {
        const response = await axios.get(`${process.env.STAKEHOLDERS_SERVICE_URL}/profiles/getByUserId?user_id=${userId}`);
        return true;
    } catch (error) {
        return false;
    }
};
