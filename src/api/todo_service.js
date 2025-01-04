import { Todo } from "../models/todo.js";
import { Message } from "../component/message.js";
import { ApiUrls } from "./config.js";

export class TodoService {
    /**
     * API 通信を行う関数の作成。
     */
    static async fetchFromApi(url, options = {}) {
        // メッセージの処理を終了(例:エラーメッセージの非表示)
        Message.dispose()
        
        // 非同期で API からデータを取得
        return fetch(url, options)
            .then((res) => {
                // レスポンスが正常か確認(ステータスコードが 200 番台)
                if(!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                // レスポンスを JSON 形式のデータとして取得
                return res.json();
            })
            .catch((error) => {
                console.error("API error:", error);
                // エラーを再スローして呼び出しもとに通知
                throw error;
            }

            )
    }

    /**
     * GetTodo を呼び出す関数。
     */
    static async getAll() {
        return this.fetchFromApi(ApiUrls.getTodo)
            .then((data) =>
                // データを Todo インスタンスの配列に変換
                data.map(
                    (item) =>
                        new Todo(
                            item.id,
                            item.title,
                            item.detail,
                            item.deadLine,
                            item.is_done,
                            item.is_deleted
                        )
                )
            )
            .catch((error) => {
                // エラーが発生した場合にログを表示し、空の配列を返す
                console.error("Error fetching todos:", error);
                return [];
            });
    }

    /**
     * ManageTodo を呼び出す関数。
     */
    static async update(formData) {
        // formData からサーバーに送信するデータを準備する
        const data = {
            post_type: formData.post_type, // 操作タイプ (例: 'create_new', 'update_content', 'update_is_done', 'update_is_deleted')
            id: formData.id,               // Todo アイテムの ID
            title: formData.title,         // タイトル (新規作成または更新時)
            detail: formData.detail,       // 詳細 (新規作成または更新時)
            deadLine: formData.deadLine,   // 締切日 (新規作成または更新時)
            is_done: formData.is_done,     // 完了フラグ (更新時)
            is_deleted: formData.is_deleted // 削除フラグ (削除時)
        };

        // fetch を使用して POST リクエストを送信する
        return this.fetchFromApi(ApiUrls.manageTodo, {
            method: "POST", // HTTPS メソッドは POST
            headers: { "Content-Type": "application/json" }, // リクエストヘッダ（）(リクエストのボディのデータが JSON 形式であることを示す)
            body: JSON.stringify(data), // body に JSON 文字列としてデータを送信
        })
            .then(() => true) // 通信成功時に true を返す
            .catch((error) => {
                console.error("Error updating todo:", error); // エラー時にエラーメッセージを表示
                return false; 
            })
    }
}
