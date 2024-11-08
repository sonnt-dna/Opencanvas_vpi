import os.path
import sqlite3
import time
from functools import lru_cache
from typing import List

from gradio_client import Client

db_path = "ktem_app_data/user_data/sql.db"


@lru_cache(1)
def get_all_file_ids(db_path: str, indices: List[int] | None = None):
    assert os.path.isfile(db_path)

    file_ids: List[str] = []

    conn = sqlite3.connect(db_path)

    try:
        c = conn.cursor()
        if indices is None:
            # Get all fileIndex
            c.execute("SELECT * FROM ktem__index")
            indices = [each[0] for each in c.fetchall()]

        # For each index get all file_ids
        for i in indices:
            table_name = f"index__{i}__source"
            c.execute(
                f"SELECT * FROM {table_name}",
            )
            file_ids += [each[0] for each in c.fetchall()]
    finally:
        conn.close()

    return file_ids


file_ids = get_all_file_ids(db_path)

# print(f"File_ids: {file_ids}")
# # file_ids_selected = ["e9da78b2-e815-400a-97ab-89175b5a59a1"]
# file_ids_selected = ["dafc34b3-b7af-433e-a56d-c1fe028e3e96"]
# client = Client("http://localhost:7860/")

# job = client.submit(
#     [
#         [
#             "Tổng hợp thông tin giúp tôi từ file này ngắn ngọn khoảng 100 từ",
#             None,
#         ]
#     ],
#     "select",
#     file_ids,
#     api_name="/chat_fn",
# )

# while not job.done():
#     time.sleep(0.1)

# # Giả sử `job.outputs()` trả về danh sách các từ điển
# outputs = job.outputs()

# print(outputs)  # Kiểm tra cấu trúc của outputs
# # print(job.outputs()[-1])