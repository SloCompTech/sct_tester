export class TesterException {
    protected mId: number;
    protected mMessage: string;

    constructor(id: number, message: string) {
        this.mId = id;
        this.mMessage = message;
    }

    public get id(): number {
        return this.mId;
    }

    public get message(): string {
        return this.mMessage;
    }

}