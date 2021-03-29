/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage'

interface IBaseStorage {
  reset: () => void
}

class BaseStorage<T> implements IBaseStorage {
  private initialStorage: T
  private storageKey: string

  constructor(initialStorage: T, storageKey: string) {
    this.initialStorage = initialStorage

    this.storageKey = storageKey
  }

  protected async setValue(storageValue: T) {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(storageValue))
    } catch (error) {
      console.log(error)
    }
  }

  protected async getValue() {
    let value: T
    try {
      const jsonValue = await AsyncStorage.getItem(this.storageKey)
      value = jsonValue !== null ? JSON.parse(jsonValue) : this.initialStorage
    } catch (error) {
      value = this.initialStorage
      console.log(error)
    }

    return value
  }

  async reset() {
    await this.setValue(this.initialStorage)
  }
}

export default BaseStorage
