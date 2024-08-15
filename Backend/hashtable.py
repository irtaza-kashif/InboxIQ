class HashTable:
    def __init__(self, size):
        self.size = size
        self.table = [None] * size
    
    def hash_function(self, key):
        return hash(key) % self.size

    def insert(self, key, value):
        index = self.hash_function(key)
        if self.table[index] is None:
            self.table[index] = []
        self.table[index].append((key, value))

    def retrieve(self, key):
        index = self.hash_function(key)
        if self.table[index] is not None:
            for kvp in self.table[index]:
                if kvp[0] == key:
                    return kvp[1]
        return None

    def delete(self, key):
        index = self.hash_function(key)
        if self.table[index] is not None:
            for i, kvp in enumerate(self.table[index]):
                if kvp[0] == key:
                    del self.table[index][i]
                    return True
        return False
